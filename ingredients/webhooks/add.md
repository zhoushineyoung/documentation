
## Register Webhook on Dashboard

To register a webhook on the Dashboard, open the [Webhooks](https://dashboard.branch.io/#/webhook) page.

Click Add a new webhook to get started.

{% image src='/img/ingredients/webhooks/add.png' half alt='add a new webhook button' %}

<div class="full-width">We've layed out the webhook registration in a sentence format. The format is:</div>

<div class="attention-grabber">Send a webhook to [ WEBHOOK URL ] [ EVERY TIME / THE FIRST TIME ] users trigger the event [ EVENT ].</div>

{% image src='/img/ingredients/webhooks/edit.png' half center alt='add a new webhook' %}


### Enter your webhook URL

First, enter the webhook URL in your own web server URL that you would like the events to be posted to.

For testing, you can try out using a URL from [RequestBin](http://requestb.in/). More information on that [below](/recipes/webhooks_and_exporting_data/#example-using-requestbin-to-test).


### Choose frequency of webhook

There are two options for frequency (as seen above). Either you can receive a webhook for every single event called or can receive it the first time only for each user.


### Choose event for which to receive webhook calls

The first step is to register for which events you`d like to receive a webhook for. These can be tailored to:

1. [Branch-provided events](/recipes/advanced_referral_incentives/{{page.platform}}/#standard-events): `install`, `open`, `referred session`, and `web session start`
1. Specific, [custom events](/recipes/advanced_referral_incentives/{{page.platform}}/#custom-events), like `purchase` or `share`
1. a wildcard event `*` which will return every single event tracked through Branch

(Branch automatically tracks `installs`, `opens`, `referred session` and `web session start` events as soon the native library is run on a device. Any other events will be recorded through the userCompletedAction function of the native library.)

The example above shows a wildcard webhook with event name `*`.


### Add filters (optional)

Filters allow you to specify when a webhook gets sent to your back-end based off criteria matches. The filters you choose are specified from the metadata found inside an event.

Event metadata is passed via the SDK. The specific method is `userCompletedAction`, with the param `withState`, where state is a JSON dictionary of key/value pairs. More information on saving events [here](/recipes/advanced_referral_incentives/ios/#tracking-events).

Let's say you're interested in receiving a webhook on every `sign_up` event you're tracking, but only in a specific market, like Chicago. If your event metadata looked like the following:

    event: "sign_up",
    metadata: {
        "city" : "Chicago",
        "username" : "john_smith_1",
    }

We can send you a webhook only when `city` is equal to `Chicago`. In order to specify a filter on the key `city`, we require the following structure:

`branch_data.event.metadata.city`.

The value, in this case, would be "chicago". Note, however, that if you wanted to filter on `username`, you would do:

`branch_data.event.metadata.username`.

In case you want to filter on just a key, you can put a * in the value box.

The end product would look like this:

![filter webhook](/img/ingredients/webhooks/filters.png)

For reference, Branch automatically tracks the **install**, **referred session** and **open** event, so if you're interested in something like only being notified when an install occurs based off of a Branch link, you can do that without using `userCompletedAction`. The filter, in this case, would simply be:

`branch_data.event.metadata.referred`

And you would add `true` inside the value box.

### Add templates (optional)

If your back-end relies on a dynamic URL structure to receive events, then we can support you with our webhooks. This is typically used for marketing campaigns, where a unique parameter needs to be appended to each link-click, and consequently posted back to a URL. You can also expose data we collect on the URL itself, through our templates. Here are the two options for templates and webhooks:

#### Query Parameters on Branch Links

Let's say you have created a Branch link in the Marketing tab specifically for SEM campaigns and want to track query parameters. Potentially something like below:

*http://bnc.lt/my-sf-campaign?clickId=12345*

And you wanted to return that value-- `12345`--back to your back-end. When setting up a webhook, you'd use liquid tags, which follow this convention: {{ param.name }}, and we'll pass through that value we have saved in our database. In case there isn't anything, it'll simply be empty.

**NOTE** this works for all types of Branch links, and not just marketing links.

![template webhook](/img/ingredients/webhooks/templates.png)

Any query parameter you add to Branch Links will be captured and stored. You will need to follow this format: *session.link_click.query* and specify the key from the query string to pass through the value, as shown in the example above. So, if you had *?clickId=5&deviceId=7*, our database would save and webhook them as *session.link_click.query.clickId* and *session.link_click.query.deviceId*, respectively. 


#### General templates without Query Parameters

If you want to add other fields, like **device** ID, event name or metadata, and more, you can do that as well. For example, let's say you have an endpoint that accepts a `GET`, and one of the required parameters are `device.id`, and `event.name`. In this case, that would look like the following:

![template non query webhook](/img/ingredients/webhooks/templates2.png)

These values are all pulled from our database and sent to you as a passthrough, so you can dump all device IDs you see in realtime, or anything else. These are the following supported parameters:

	event.name // name of custom event tracked through SDK
	event.metadata.key // metadata saved for your key
	event.date // timestamp of event save
	identity.id // unique Branch ID of device
	identity.link_click.date // date of unique user clicking link
	identity.referring_identity.id // id of referrer
	identity.link // link that user clicked
	identity.referring_device.hardware_id // device id of referrer
	session.link_click.date // date of session start after link_click
	session.referring_identity.id // Id of referrer (branch Id)
	session.link // link that started session
	session.referring_device.hardware_id // device id that started session
	device.hardware_id // device id per event
	device.google_advertising_id // google ad-id per event
	browser.branch_id // our branch id for a browser
	browser.metadata.userAgent // user agent for browser
	device.metadata.os // os
	device.metadata.os_version // os version

**NOTE** This is the structure for sending `GET` requets, with dynamic URLs. In case you need this data to be in the body of a `POST`, then it would work the same.

### Save and Confirm


After you press `Add webhook`, you should see the webhook in the list of your reward rules.

{% image src='/img/ingredients/webhooks/added.png' 2-thirds alt='save and confirm' %}
