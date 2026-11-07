# Google Ads website calls

Prepared, **not enabled**, and **not verified in the Ads account**. This change
does not deploy, merge, or turn the tag on. Production HTML keeps a single
GA4 loader (`G-L5RB0B2JTL`) and does not mention `AW-18560918238`.

## What was added

The existing gtag in `src/layouts/Layout.astro` stays the only Google loader.
When the build flag is exactly `on`, that same tag also runs:

```js
gtag('config', 'AW-18560918238');
gtag('config', 'AW-18560918238/AJwWCMXj2rMdEN7FxJJF', {
  phone_conversion_number: '(615) 410-7170',
  phone_conversion_callback: /* swaps text, aria-label, and tel: */
});
```

That is the current website-call snippet from Google Ads Help
([adapt an existing Google tag](https://support.google.com/google-ads/answer/7548399),
[calls to a number on your website](https://support.google.com/google-ads/answer/6095883)),
read 2026-11-07. It is not the new-install sample that loads `gtag.js` with
`GTM-M83NJ4MQ`. Do not install that container and do not add a second GA4 loader.

`phone_conversion_number` is `(615) 410-7170`, with the space the site
renders. The email's `(615)410-7170` does not match the page, and Google's
help says the snippet then cannot find the number. `tel:+16154107170` is a
different string. The callback updates business `tel:` links, including the
mobile icon button (no digits in the button text, so Google's automatic scan
does not rewrite it), and visible text. It runs only after Google returns a
forwarding number. It does not walk `script`, so JSON-LD keeps
`+16154107170`. If Google never calls it, the published number stays. Schema
`telephone` stays `+16154107170` because that string does not match the
snippet and the callback does not walk `script`. FAQ JSON-LD answers still
contain the display number as prose; this change does not edit that copy.

There is no `gtag('event', 'conversion')`. A page view is not a call.
`phone_call_click` is still the GA4 click event, not a completed call.
Google counts a call only when someone dials the forwarding number and the
call meets the duration configured on the conversion action. That duration
is an account setting. It is not in this snippet. The owner said 60 seconds.
This repo cannot see whether the action is actually set that way.

## Gate

`PUBLIC_ADS_PHONE_CONVERSION` is read at **build** time by Astro
(`import.meta.env`). A Worker runtime variable does nothing: the snippet is
already either in the HTML or not.

| Value at `astro build` | Result |
| --- | --- |
| unset, empty, or anything other than `on` | no `AW-` config, no phone snippet |
| `on` | commands above are added to the existing tag |

`PUBLIC_GA4_ID` empty still removes the whole Google tag, including this
config. Do not add a separate Ads loader to get around that.

The CSP in `public/_headers` and `vercel.json` allows the Google Ads
conversion hosts from the Tag Platform CSP guide (page updated 2026-09-18)
for a conversion tag: `googleadservices.com`, `google.com`,
`googleads.g.doubleclick.net`, `pagead2.googlesyndication.com`, and
`ad.doubleclick.net`, plus `googletagmanager.com` in `frame-src`.
`script-src` already covers `script-src-elem`. Country TLDs are not
wildcarded. `tagmanager.google.com` is not allowed. The wider CSP does not
send hits by itself.

## Still blocked on account access

Do not treat any of the following as done:

- The read-only invitation is not accepted here, and live access was not verified.
- GA4 property `550136055` had no Ads link when last checked.
- The action's call length, counting (one vs every), primary vs secondary,
  source (website vs ads vs import), duplicates, auto-tagging, and call
  reporting were **not** read back from the account.
- No campaign, budget, bid, or conversion setting was changed.

Before setting the flag on a production build, confirm in customer
`907-170-2452`:

1. The website-call action's id/label are `AW-18560918238` /
   `AJwWCMXj2rMdEN7FxJJF`, and the number on the action is this shop's number.
2. Call length is 60 seconds, matching the owner's instruction.
3. Counting and primary/secondary will not double-count the separate
   calls-from-ads action. Google's help says only one of two actions that
   track the same calls should be included in "Conversions".
4. Auto-tagging is on, so the click id exists for the forwarding number.
5. There is no second import of the same calls.

## Activation

1. Finish the checklist above. Stop if any row is unverified.
2. Build with the flag, still without promoting production:

   ```bash
   PUBLIC_ADS_PHONE_CONVERSION=on npm run build
   ```

3. Preview only as a non-production Worker version. Do not click a live ad
   (that spends money and is a real click). Do not POST a synthetic
   conversion to `AW-18560918238` or to GA4 `G-L5RB0B2JTL`.
4. On that preview, confirm one `gtag/js?id=G-L5RB0B2JTL`, both `config`
   commands, no `GTM-` id, and no conversion event. Load the page without a
   `gclid`: the visible number and `tel:+16154107170` stay. A real forwarding
   swap requires an ad click, which needs an explicit spend approval.
5. Promote only after that preview looks right.

The privacy page discloses the Ads call tag only on builds where the flag is
`on`. It does not add a cookie banner and does not set Consent Mode to
granted or denied, so the existing GA4 tag is unchanged.

## Rollback

1. Build again **without** `PUBLIC_ADS_PHONE_CONVERSION` and deploy that
   output. The `AW-` commands disappear. The CSP hosts can stay; they do
   not call Google unless a tag asks.
2. Purge the edge cache so old HTML is not served.
3. Testers who already received a forwarding number may still have Google's
   `gwcc` cookie. Clearing it returns the published number. Rollback does
   not delete that cookie from their browser by itself.

To turn the snippet off without a code change, the flag is enough. Revert
the commit if the CSP widening should leave as well.
