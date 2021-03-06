---
type: recipe
title: "Facebook App Invites"
platforms:
- ios
- android
---

Facebook launched it's new App Invites feature as an alternative to sharing to the wall to help you grow your app. It's similar to a direct SMS as it's a private invite from 1 friend to another as opposed to a public post on the wall. The good news is that your Branch deep links that you've set up for SMS, email and Twitter shares work the exact same way for invites. Here's a simple guide on how to do it.

{% image src='/img/recipes/appinvites/appinvite.png' third center alt='app invite' %}

{% protip title="Still need to integrate Branch or Facebook?" %}This guide assumes that you have already integrated Branch and are just curious how to use Branch with App Invites. If you need to integrate Branch still, jump to "[Integrating the SDK](/recipes/quickstart_guide/{{page.platform}}/)". If you need integrate Facebook, you can find instructions {% if page.ios %}[in this guide](https://developers.facebook.com/docs/ios/getting-started).{% endif %}{% if page.android %}[in this guide](https://developers.facebook.com/docs/android/getting-started).{% endif %}
{% endprotip %}

## Insert Branch link into Invite

Every Branch link automatically comes packed with all of the AppLinks to automatically handle deep linking off of Facebook posts. The Branch link will work for both _fresh installs_ for new users and _opens_ for users who already have the app. You can show a personal welcome for each!

<!--- iOS -->
{% if page.ios %}

{% tabs %}
{% tab objective-c %}
{% highlight objc %}
#import "Branch.h"
#import <FBSDKShareKit/FBSDKShareKit.h>
{% endhighlight %}

{% highlight objc %}
[[Branch getInstance] getShortURLWithParams:branchDict
                                 andChannel:@"facebook"
                                 andFeature:@"app_invite"
                                andCallback:^(NSString *url, NSError* error) {
    if ([FBSDKAppInviteDialog canShow]) {
        FBSDKAppInviteContent *content =[[FBSDKAppInviteContent alloc] init];
        content.appLinkURL = [NSURL URLWithString:url];
        content.appInvitePreviewImageURL = [NSURL URLWithString:@"https://s3-us-west-1.amazonaws.com/host/zackspic.png"];
                                        
        [FBSDKAppInviteDialog showWithContent:content
                                     delegate:self];
    }
}];
{% endhighlight %}

{% highlight objc %}
// add these methods in if you extend your sharing view controller with <FBSDKAppInviteDialogDelegate>
- (void)appInviteDialog:(FBSDKAppInviteDialog *)appInviteDialog
 didCompleteWithResults:(NSDictionary *)results {
    [[Branch getInstance] userCompletedAction:@"completed_share"];
    NSLog(@"app invite dialog did complete");
}

- (void)appInviteDialog:(FBSDKAppInviteDialog *)appInviteDialog
       didFailWithError:(NSError *)error {
    [[Branch getInstance] userCompletedAction:@"cancelled_share"];
    NSLog(@"app invite dialog did fail");
}
{% endhighlight %}

{% endtab %}
{% tab swift %}
{% highlight swift %}
params["referring_user_id"] = "1234"
params["referring_user_name"] = "Zack Zuckerberg"
Branch.getInstance().getShortURLWithParams(params, "facebook", "app_invite" andCallback: { (url: String?, error: NSError?) -> Void in
    // We're not sure how to create app invites in Swift
    // if you know, please make a pull request on this repo https://github.com/BranchMetrics/documentation/blob/master/recipes/facebook_appinvites.md
})
{% endhighlight %}
{% endtab %}
{% endtabs %}


{% endif %}

<!--- /iOS -->


<!--- Android -->
{% if page.android %}


{% highlight java %}
JSONObject params = new JSONObject();
try {
    params.put("referring_user_id", "1234");
    params.put("referring_user_name", "Zack Zuckerberg");
} catch (JSONException ex) { }
Branch branch = Branch.getInstance(getApplicationContext());
branch.getShortUrl("facebook", "app_invite", null, params, new BranchLinkCreateListener() {
    @Override
    public void onLinkCreate(String url, Branch.BranchError error) {
		if (AppInviteDialog.canShow()) {
			AppInviteContent content = new AppInviteContent.Builder()
		                .setApplinkUrl(url)
		                .setPreviewImageUrl("https://s3-us-west-1.amazonaws.com/host/zackspic.png")
		                .build();
			AppInviteDialog.show(this, content);
		}
    }
});
{% endhighlight %}
{% endif %}
<!--- /Android -->

## Show Custom Welcome

Since you dropped a Branch link into the URL for the AppInvite, you can use Branch to determine if a new user came from an existing app user. Below, you can see an example that our partner Gogobot built using the Branch deep link callback. The screen below is what a user sees if they came from a referring Branch link, compared to the generic onboarding which just shows a fancy picture. It drove a  **78% lift in conversion** to register.

{% image src='/img/recipes/appinvites/gogobot_onboarding_screens.png' actual center alt='app invite' %}

Here's how to build it:

<!--- iOS -->
{% if page.ios %}

{% tabs %}
{% tab objective-c %}
{% highlight objc %}
#import "Branch.h"
#import <FBSDKCoreKit/FBSDKCoreKit.h>
{% endhighlight %}

{% highlight objc %}
- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication annotation:(id)annotation {
    BOOL wasHandled = [[Branch getInstance] handleDeepLink:url];
    if (!wasHandled)
        [[FBSDKApplicationDelegate sharedInstance] application:application
                                                       openURL:url
                                             sourceApplication:sourceApplication
                                                    annotation:annotation];
    
    return wasHandled;
}

{% endhighlight %}

{% highlight objc %}
- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication
         annotation:(id)annotation {
    // NOTE: Branch must come first
    BOOL wasHandled = [[Branch getInstance] handleDeepLink:url];
    if (!wasHandled)
        [[FBSDKApplicationDelegate sharedInstance] application:application
                                                       openURL:url
                                             sourceApplication:sourceApplication
                                                    annotation:annotation];
    return wasHandled;
}

{% endhighlight %}

{% endtab %}
{% tab swift %}
{% highlight swift %}
import FBSDKCoreKit
import Branch

{% endhighlight %}


{% highlight swift %}
func application(application: UIApplication, didFinishLaunchingWithOptions launchOptions: [NSObject: AnyObject]?) -> Bool {
    branch.initSessionWithLaunchOptions(launchOptions, andRegisterDeepLinkHandler: { params, error in
        if (params["+clicked_branch_link"]) {
            NSLog("new session was referred by %@", params["referring_user_name"])
            // show personal welcome view controller
        }
    })

    // We're not sure how to init the Facebook SDK in Swift
    // if you know, please make a pull request on this repo https://github.com/BranchMetrics/documentation/blob/master/recipes/facebook_appinvites.md

    return true
}
{% endhighlight %}

This method is for handling the case where the app is already installed the URI scheme gets called.

{% highlight swift %}
func application(application: UIApplication, openURL url: NSURL, sourceApplication: String?, annotation: AnyObject?) -> Bool {
    // pass the url to the handle deep link call
    Branch.getInstance().handleDeepLink(url)

    // We're not sure how to init the Facebook SDK in Swift
    // if you know, please make a pull request on this repo https://github.com/BranchMetrics/documentation/blob/master/recipes/facebook_appinvites.md

    return true
}

{% endhighlight %}

{% endtab %}
{% endtabs %}



{% endif %}
<!--- /iOS -->


<!--- Android -->
{% if page.android %}

{% highlight java %}
import io.branch.referral.Branch;
import com.facebook.FacebookSdk;
{% endhighlight %}


{% highlight java %}
@Override
protected void onStart() {
    super.onStart();
    Branch branch = Branch.getInstance(getApplicationContext());
    branch.initSession(new BranchReferralInitListener(){
        @Override
        public void onInitFinished(JSONObject referringParams, BranchError error) {
            if (referringParams.getBoolean("+clicked_branch_link")) {
            	Log.i("MyApp", "new session was referred by " + referringParams.getString("referring_user_name"));
	    		// show personal welcome view controller
        	}
        }
    }, this.getIntent().getData(), this);
}

{% endhighlight %}

Next, you'll need to hook into the `onNewIntent` method specified inside the Activity lifecycle and set the intent. This is required for conformity with Facebook's AppLinks. Verify that the activity you're implementing has *launchMode* set to *singleTask* inside the Manifest declaration. Once that'd done, go to said activity and do something like the folllowing:

{% highlight java %}
@Override
public void onNewIntent(Intent intent) {
    this.setIntent(intent);
}
{% endhighlight %}

On Android, you also need to be sure to properly close the session inside `onStop` with a `branch.closeSession()`. This helps us manage a session across activities.

{% highlight java %}
@Override
protected void onStop() {
    super.onStop();
    branch.closeSession();
}
{% endhighlight %}

{% endif %}
<!--- /Android -->


## Troubleshooting

{% image src='/img/recipes/appinvites/missing_applinks.png' quarter right alt='troubleshooting' %}

If Facebook is having trouble reading the AppLinks from the Branch link, you might see this message while trying to test out the flow. This means that there is something corrupted in the OG tags causing Facebook to not parse it. You can test the OG tags using the following tool provided by Facebook:

[OG tag tester](https://developers.facebook.com/tools/debug/og/object)

If your OG tags look fine and you're still getting this error, please reach out to support@branch.io immediately.
