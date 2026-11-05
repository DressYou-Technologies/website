## 1. Who is responsible

DressYou is operated by <mark class="open" data-id="operator-identity"><b>Founder to decide:</b> the company's legal name, legal form, registered address and registration number</mark>, the controller of the personal data this notice describes. Questions about your data and requests to exercise your rights go to <mark class="open" data-id="privacy-contact"><b>Founder to decide:</b> the address that receives privacy questions and rights requests</mark>. DressYou has not appointed a data protection officer <mark class="open" data-id="dpo"><b>Counsel to confirm:</b> Does the feed's ranking, as regular and systematic monitoring, or body data at scale require one?</mark>.

This notice covers the DressYou apps for iOS and Android, the DressYou browser extension, the website dressyouapp.com and the pages a friend opens from an ask link.

## 2. What DressYou processes, and why

Each purpose below names the data and the legal basis DressYou relies on; section 6 says how long each is kept. <mark class="open" data-id="legal-bases"><b>Counsel to confirm:</b> Confirm each legal basis proposed in this section; the open questions are A5, A8, B14 and C1 of the counsel brief.</mark>

### 2.1 Your account

Your email address; your password, stored only as a hash; your Sign in with Apple identifier, if you use it; your passkeys and two-step verification settings; the version of the terms and of this notice you accepted, and when; an optional profile photo; and, for each signed-in device, the session's dates, IP address and device description. A browser you link through the extension keeps its browser name, platform and dates, and no IP address. <mark class="open" data-id="google-sign-in"><b>Founder to decide:</b> Does Google sign-in ship at launch? §4.1 draws it; the code has none.</mark>

DressYou uses this data to create your account, sign you in, keep the account secure and send the emails it needs: address verification and password reset. Legal basis: the contract (Article 6(1)(b) GDPR), and DressYou's legitimate interest in protecting accounts and detecting abuse (Article 6(1)(f)).

### 2.2 Body capture and your twin

The photographs of you that you provide, taken in the app or imported: the first front, the second back, and any further ones as appearance context; your twin, the two images, front and back, generated from them; and, if you use Adjust, the words you add to describe a change. Before the first upload you confirm that you are 18 or over and that the photographs show only you; DressYou records both confirmations with the notice version and the date. <mark class="open" data-id="capture-photo-count"><b>Founder to decide:</b> Should capture be limited to the front and back photographs? The app imports up to 16, the API accepts up to 20, and the worker sends up to 16 to the image provider for the twin, refusing a source with more.</mark>

The photographs make your twin and nothing else: DressYou takes no measurement from a photograph. Your twin is how DressYou shows garments on you when you ask.

Legal basis: your explicit consent (Article 9(2)(a) GDPR), which you withdraw by removing your capture in the app. DressYou then erases the photographs, the twin and every image made from them; storage keeps an earlier copy of each for recovery until it is deleted, as section 6 describes. Consenting to body capture is not consenting to the generation or publication of a portrait for a card. <mark class="open" data-id="article-9-scope"><b>Counsel to confirm:</b> Are body photographs, the twin and typed measurements special-category data when nothing is processed to identify anyone? Counsel brief A5(1).</mark> <mark class="open" data-id="body-consent-act"><b>Counsel to confirm:</b> Do the two recorded confirmations under a dated notice amount to explicit consent, or must a separate act name this purpose and the image provider? Counsel brief A5(2), B10(1).</mark>

An age check takes place after your capture is complete and before DressYou processes any photograph. <mark class="open" data-id="age-assurance"><b>Founder to decide:</b> the age-assurance provider, what it receives and keeps, and where it processes</mark> <mark class="open" data-id="age-assurance-basis"><b>Counsel to confirm:</b> Which legal basis covers the age check, what follows when it finds a minor, and is a refusal by the check a decision under Article 22? Counsel brief B13.</mark>

<h3 id="ai">2.3 AI: OpenAI and TypeSafe</h3>

DressYou asks your permission once, before any of your photographs or messages reaches an AI provider: when you make your twin, add a photographed garment or write to the stylist, whichever comes first. With it, OpenAI receives your front and back photographs, to make your twin, then your twin for each try-on, and photographs of your garments, to make their images. It also receives your messages to the stylist and the wardrobe facts each reply needs, to answer you (section 2.6). TypeSafe receives your messages to the stylist and the stylist's replies, to check them. The weather and country code a message carries are described in section 2.12. <mark class="open" data-id="jev-garment-photos"><b>Founder to decide:</b> Once its key is set, TypeSafe also reads photographs of your garments for their category, formality and season: name it here, or only in the terms as decided on 29 October 2026?</mark>

DressYou keeps your twin photographs until you replace or delete them. They are never measured or used for anything else. DressYou stores your data in the EU (Sweden), and OpenAI processes what it receives in the United States, outside the European Economic Area, until European processing is approved (section 5). You withdraw this permission in privacy & safety, in the app, where deleting your twin photographs is a separate control. Withdrawing refuses every new send at once and keeps your twin, photographs and images until you delete them.

DressYou generates images with OpenAI's image model. OpenAI receives, for your twin, all your capture photographs, front, back and any further ones, and any Adjust words; for an outfit image, your approved twin and the garment images, never your capture photographs; for a garment image, the framed garment alone. For an outfit image it also receives a pose description chosen from your pose answer, never the answer itself.

DressYou's production service uses OpenAI's global processing, outside the European Economic Area, until OpenAI approves European processing for DressYou. By default OpenAI keeps the inputs and outputs it receives for up to 30 days to monitor abuse, and may have flagged content reviewed by a person. DressYou has asked OpenAI for shorter retention; until it is granted, deleting data in DressYou does not delete those copies. <mark class="open" data-id="openai-terms"><b>Founder to decide:</b> Is OpenAI's modified retention granted and signed before launch?</mark> <mark class="open" data-id="openai-transfer"><b>Counsel to confirm:</b> Which safeguard covers the transfer of these images to OpenAI outside the EEA, and what must this notice say about it? Counsel brief B10(2).</mark>

Every generated image carries a visible mark saying it is generated.

### 2.4 Measurements you enter

Measurements are optional, and none is asked at sign-up or during capture: you add them in the app whenever you choose. <mark class="open" data-id="capture-height"><b>Founder to decide:</b> The app still asks your height with the capture photographs and the API requires it, while decision 35 has no measurement step in onboarding: remove height from capture before publication?</mark> They are your height and the tape measurements you enter, and your fit reports on garments you own, including a correction you make to an image of a garment you own; the size of a garment you own also serves as a size anchor. DressYou stores them as ranges, never asks your weight, and takes none from a photograph.

DressYou uses them to tell you which size of a garment will fit and, in the feed, to show you lower a post whose garment comes in no size that fits you (section 2.7). <mark class="open" data-id="measurement-uses"><b>Founder to decide:</b> Decision 35 says measurements serve the size recommendation only, while §4.8 ranks a post lower when no size fits: keep both uses, or take fit out of feed ordering?</mark> When it has too little to go on, the size answer says so and offers two ways to get one: add a garment you own with its size, or add your measurements; the try-on works either way. Legal basis: your explicit consent, as for body capture; the questions in section 2.2 apply. You can withdraw a measurement at any time; it stops influencing results at once, and its history stays until you delete your account. <mark class="open" data-id="withdrawn-measurement-history"><b>Counsel to confirm:</b> Is keeping a withdrawn measurement's history until account deletion justified, or must withdrawal erase it?</mark>

### 2.5 The pose answer

Before the scan DressYou asks once, optionally: woman, man or skip. The answer is used only to choose the poses of your outfit images. It is never inferred, and never used for sizing, the stylist, recaps or the product's wording. It is kept with your capture photographs and erased with them, and it never reaches analytics or error reports. <mark class="open" data-id="pose-answer-basis"><b>Counsel to confirm:</b> Which legal basis covers the answer, and does it need protection beyond its single use, since it can reveal gender identity? Counsel brief A5(4).</mark>

### 2.6 Wardrobe, try-ons and the stylist

The garments you add, from product pages you capture or photographs you take; your wardrobe categories, outfits and wear records; your try-on history and the images in it; your wish list; your purchase reports and the sizes you bought; your style rules; your outfit discussions with the stylist; and the monthly and yearly cards you make, which never show sizes, measurements, fit assessments or body comparisons.

When you capture a product page, in the extension or from the app, your own device reads the page; DressYou's server never fetches a retailer's page. The extension reads pages only while it is linked to your account, and records a purchase only when you review it from the toolbar. A garment scan crops a detected face on your device before the photograph is kept or sent. If a garment photograph shows a person, the server detects it only to keep the person out of the garment image, and keeps nothing from that detection except, when the photograph shows a whole person, the fact that it was refused.

To answer you, the stylist reads your wardrobe, outfits, wear records, try-on history, style rules, public posts and profile facts other than your measurements and your pose answer. Comments on posts, hashtags and comments on asks never reach it. For now, OpenAI's text model reads your message, the conversation so far and the wardrobe facts the stylist needs, outside the European Economic Area until European processing is approved. TypeSafe checks each message before it is kept and each reply before it is shown. Each message also carries the weather and the country of section 2.12.

Legal basis: the contract.

### 2.7 Posts and the feed

Your posts: your photographs, captions, hashtags and garment links, and your declaration that anyone else pictured agreed to appear. Your public name and, if you add one, your public photo, which is off by default. Your comments, likes, saves, follows and blocks. Likes and saves are shown without counts.

A photograph you post is read for its style, never for your body. In the first release the everyone tab orders posts with a small fixed rule from taste and engagement, and shows you lower a post whose garment comes in no size that fits you; commission never affects the order, and DressYou does not compare one person's body with another's. When another adult tries on a garment your post links, DressYou counts it toward your earned renders. Someone who shares your post outside DressYou shares only a link that opens it in DressYou; no copy of your photograph leaves DressYou that way.

Legal basis: the contract, since DressYou publishes what you ask it to. <mark class="open" data-id="post-special-category"><b>Counsel to confirm:</b> A photograph can reveal special-category data: is it made public by the poster under Article 9(2)(e), or does it need explicit consent?</mark> <mark class="open" data-id="ranking-basis"><b>Counsel to confirm:</b> Does ordering the feed from consented taste signals, and from the viewer's own fit, rest on the contract, or need its own consent? Counsel brief B14(1).</mark> <mark class="open" data-id="post-audience"><b>Founder to decide:</b> Who can see a post (working assumption: signed-in users only), can posts be seen outside the app, and can a poster limit the audience?</mark>

### 2.8 Moderation and safety

The results of automatic screening of posts, captions, hashtags and comments, including matching against known child sexual abuse material; reports from accounts and notices from anyone, with the notifier's contact details if given; decisions, statements of reasons and appeals; and account suspensions.

DressYou uses this data to apply its rules and the law, to answer notices and to inform the authorities where the law requires. Legal basis: DressYou's legal obligations under the Digital Services Act (Article 6(1)(c)) and its legitimate interest in keeping the service safe. <mark class="open" data-id="moderation-basis"><b>Counsel to confirm:</b> Which legal basis covers automatic screening of every post, and is holding a post for review a decision under Article 22?</mark> <mark class="open" data-id="moderation-vendors"><b>Founder to decide:</b> the vendors for image screening, known-CSAM matching and text screening, what each receives, and where it processes</mark>

### 2.9 Ask a friend

When you ask friends for an opinion, DressYou keeps the outfit or the options you send, your optional question and, if you include them, copies of your garment photographs or an outfit image of your twin; by default friends see garments alone. Anyone with the link can open it and forward it.

A friend votes without an account. DressYou keeps the vote, an optional one-line comment and a random identifier set as a cookie on that link's pages; the database keeps only a hash of the identifier, and no IP address. Product pictures on the ask page load from the retailers' own servers, which therefore see the visit. <mark class="open" data-id="guest-vote-basis"><b>Counsel to confirm:</b> Which legal basis covers a non-user's vote and comment, is the voter cookie exempt from consent, what notice must the page give, and what follows for a voter who is a minor? Counsel brief C1.</mark>

### 2.10 Purchases, renders and shop links

The paid tier and render purchases are paid to Apple or Google through their stores; DressYou never receives your card details. DressYou receives the store's record of each transaction and its notifications, and checks them on its own server to confirm what you bought. It also keeps your render balances: the free allowance, earned renders and purchased renders.

A shop link carries a new random reference on each tap, which never names your account. The retailer and its affiliate network record the visit under their own privacy notices, and the network later reports whether a purchase was approved, declined or amended. DressYou keeps a purchase record: the size bought, the dates, the size answer shown, your fit answer, and whether the garment was kept or returned, with the basis for it. You can delete a purchase record, and its influence leaves every value derived from it.

DressYou may test offers, prices and interfaces by assigning accounts to groups at random.

Legal basis: the contract; DressYou's legal obligations for accounting records.

### 2.11 Usage events, analytics and crash reports

DressYou records events in its own database. A few events record a step needed to deliver what you asked for, such as a capture you completed, the size you chose at purchase, a correction to your own record, or a garment you added or wore; they are recorded without asking. Every other event is recorded only with your consent, and each event keeps the consent state at the time it was recorded. Refusing costs no feature: you still save and use your own records. <mark class="open" data-id="analytics-consent-control"><b>Founder to decide:</b> Where does the app ask this consent, and where is it changed?</mark> <mark class="open" data-id="essential-events"><b>Counsel to confirm:</b> Are these events outside consent, both under the GDPR as necessary for the contract and under the ePrivacy rule on device access? Counsel brief A8(1).</mark>

DressYou's server forwards only consented events and aggregate figures to PostHog, hosted in the EU (Frankfurt), through a list of allowed events. No analytics software runs in the apps, session replay is off, and no body data, measurement, pose answer or photograph reaches analytics. <mark class="open" data-id="posthog-purpose"><b>Counsel to confirm:</b> Is that forwarding covered by the same consent, or is it a separate purpose? Counsel brief A8(2).</mark>

The apps send crash reports, and the server sends technical traces, to Sentry, hosted in the EU. They never carry an image, body data, a measurement or the pose answer. <mark class="open" data-id="crash-reporting-basis"><b>Counsel to confirm:</b> Do crash reports from the apps need consent under the ePrivacy rule on device access, or do they rest on legitimate interest?</mark>

### 2.12 Notifications, weather and support

If you allow notifications, DressYou sends them through your device platform's notification service.

The app asks to use your location the first time weather would change an outfit. If you allow it, the app reads your location at city level, only while you use it; it never tracks your location in the background and never uses your precise location. If you decline, outfit suggestions leave weather out. Each message you send the stylist carries the 10-day forecast and the 12 monthly averages for your phone's city, never your location. DressYou uses only the days you ask about and keeps none of it. The message also carries your city's country code, which DressYou does not keep. Apple's WeatherKit and Apple's map service receive your approximate location from your phone. Legal basis: your consent, which you withdraw in your device settings.

Support is one channel in the app. DressYou keeps your messages and its replies to answer you. Legal basis: the contract.

<mark class="open" data-id="website-signup"><b>Founder to decide:</b> the website's launch email list (Brevo, with double opt-in), which today's website notice describes, is not in this draft.</mark>

## 3. What you must provide

An email address, or Sign in with Apple, is needed to create an account. Everything else is optional. Without body capture, try-ons are unavailable; without a garment you own with its size, or your measurements, DressYou gives no size answer and says so, and the try-on still works; without the pose answer, outfit images use a neutral pose.

## 4. Who receives your data

Other users see what you post and your public profile; the people you send an ask to see what the ask contains.

DressYou's processors act on its instructions. The state column records where each stood on 13 October 2026, and OpenAI's text model on 28 October 2026: *live* is in use; *configured* means the code calls it once its setting is present; *declared* means the infrastructure is described and not applied; *planned* means decided, with no code. <mark class="open" data-id="production-applied"><b>Founder to decide:</b> Before publication, every processor below must be live under a signed data-processing agreement, and this column removed.</mark>

| Recipient | What it receives | Where | State |
|---|---|---|---|
| OpenAI, image model | Section 2.3 | Outside the EEA, including the United States, until European processing is approved | Configured |
| OpenAI, text model | Your first capture photograph, to check that it shows one whole person before your twin is made, and, planned, your conversations with the stylist (section 2.6) | Outside the EEA, including the United States, until European processing is approved | Configured |
| Amazon Web Services: hosting, database, file storage, logs | Everything the service stores and logs | Stockholm, Sweden | Declared |
| Amazon SES | Account emails: your address and the verification and reset links | Stockholm, Sweden | Declared |
| Sentry | Crash reports and technical traces, section 2.11 | EU | Configured for the server; planned for the apps |
| PostHog | Consented events and aggregate figures, section 2.11 | EU (Frankfurt) | Planned |
| Apple | Sign in with Apple; App Store purchases | Apple's own terms | Configured for sign-in; planned for purchases |
| Google | Google Play purchases | Google's own terms | Planned |
| Your device platform's notification service | The notifications you allow | The platform's own terms | Planned |
| Vercel | Connection data of the website's visitors | <mark class="open" data-id="vercel-region"><b>Founder to decide:</b> Vercel's processing region and data-processing terms</mark> | Live |
| The age-assurance provider | Section 2.2 | Section 2.2 | Planned |
| Moderation vendors | Section 2.8 | Section 2.8 | Planned |
| TypeSafe | Your messages to the stylist and its replies, to check them (section 2.6) | Not stated by TypeSafe | Planned |
| Apple: WeatherKit and its map service | Your approximate location, from your phone (section 2.12) | Apple's own terms | Planned |

OpenAI's text model is also set up in the code to read retailer page text and size charts; for that it receives no content from your account.

Retailers and affiliate networks receive the visit when you open a shop link, and retailers' servers receive the request when an ask page shows their product pictures. Authorities receive data when the law requires it, including notifications of suspected offences that threaten someone's life or safety.

## 5. Transfers outside the European Economic Area

DressYou stores your data in Stockholm, Sweden. OpenAI processes the images of section 2.3 and your conversations with the stylist (section 2.6) outside the European Economic Area, including in the United States, until it approves European processing for DressYou. <mark class="open" data-id="transfers"><b>Counsel to confirm:</b> Which recipients transfer data outside the EEA, including US access by OpenAI, Apple, Google and Vercel, and under which safeguard: an adequacy decision, including the EU–US Data Privacy Framework, or standard contractual clauses?</mark>

## 6. How long DressYou keeps your data

| Data | How long |
|---|---|
| Account | Until you delete your account. Storage keeps an earlier copy of a replaced or deleted profile photo for recovery: it becomes due for deletion at the first midnight UTC at least 7 days later, and is then deleted automatically, which can take some further time |
| Capture photographs, your twin and the images made from them | Until you replace or remove them, or delete your account. Storage keeps an earlier copy of a deleted file for recovery: it becomes due for deletion at the first midnight UTC at least 7 days later, and is then deleted automatically, which can take some further time |
| Measurements | Until you delete your account; a withdrawn measurement stops influencing results at once (section 2.4) |
| Style rules | Until you delete them; a deleted rule's text stays 30 seconds for undo, then is scheduled for erasure |
| Outfit discussions | Until you delete them or your account |
| Wardrobe, outfits, try-on history, wish list, purchase records, cards | Until you delete them or your account. Storage keeps an earlier copy of a deleted photograph or image for recovery: it becomes due for deletion at the first midnight UTC at least 7 days later, and is then deleted automatically, which can take some further time |
| Uploads never attached to anything | Eligible for erasure 24 hours after the upload; a cleanup job then erases them, later when it has a backlog. Storage keeps an earlier copy of an erased file for recovery: it becomes due for deletion at the first midnight UTC at least 7 days later, and is then deleted automatically, which can take some further time |
| Asks | The link lasts 24 hours unless you close it sooner; results stay 24 hours more; then the ask, its votes, comments and photograph copies are erased, keeping only daily counts of arrivals. Storage keeps an earlier copy of each erased photograph for recovery: it becomes due for deletion at the first midnight UTC at least 7 days later, and is then deleted automatically, which can take some further time |
| Voter cookie | Until the ask link ends |
| Sessions, with IP address and device description | A session lasts seven days and is extended while in use; an expired session is deleted only when it is presented again <mark class="open" data-id="session-purge"><b>Founder to decide:</b> A scheduled purge of expired sessions, which keep an IP address, is not built: set its period.</mark> |
| Linked browsers | Signed out after 30 days without use; no IP address is kept |
| Image links issued to your apps | Valid for five minutes |
| Application logs | 30 days, without tokens, signed links or request contents |
| Background job records | Seven days after completion; 14 days if never completed; they hold identifiers only |
| Database backups | 35 days; erased data stays in a backup until the backup ages out; if the database itself is ever deleted, a final snapshot is kept with no set expiry <mark class="open" data-id="backup-replay"><b>Counsel to confirm:</b> Are 35 days of backups holding erased data acceptable, with erasures replayed after any restore, and is a final snapshot with no set expiry acceptable? Counsel brief A5(3).</mark> |
| Copies held by the image provider | Up to 30 days (section 2.3) |
| Usage events | <mark class="open" data-id="behavioural-events-retention"><b>Founder to decide:</b> the retention period for recorded events, not yet set</mark> |
| Posts, comments, likes, saves and follows | <mark class="open" data-id="feed-retention"><b>Founder to decide:</b> periods for posts, comments, likes, saves and follows, set before posting opens</mark> |
| Reports, notices, decisions and appeals | <mark class="open" data-id="moderation-retention"><b>Founder to decide:</b> how long reports, notices, decisions, statements of reasons and appeals are kept</mark>; when a reporter's account is deleted, the report loses its link to that account and the decision remains <mark class="open" data-id="lcen-retention"><b>Counsel to confirm:</b> Does the French decree on hosts' retention of contributor data oblige DressYou to keep data identifying the authors of posts, comments and votes, and for how long? Counsel brief B15.</mark> |
| Records of image-provider calls | Kept; on account deletion the link to the account is removed <mark class="open" data-id="ledger-after-erasure"><b>Counsel to confirm:</b> Once the account is erased, is a record that keeps the provider's request identifier still personal data, and how long may cost records be kept? Counsel brief C2.</mark> |
| Records of what you bought from DressYou: the paid tier and renders | <mark class="open" data-id="purchase-records-retention"><b>Counsel to confirm:</b> How long must purchase and billing records be kept under French accounting and tax rules?</mark> |
| Support messages | <mark class="open" data-id="support-retention"><b>Founder to decide:</b> how long support conversations are kept</mark> |

## 7. Your rights

You have the right to access your data, to have it corrected or erased, to restrict its processing, to object to processing based on legitimate interest, and to receive the data you provided in a portable format. Where processing rests on your consent, you can withdraw it at any time, without affecting what was done before. Under French law you can also give instructions on what happens to your data after your death.

In the app you can export everything your account holds as one file, whose image links work for five minutes, correct your records and measurements, and delete items or your whole account; export and deletion ask you to sign in again if your last sign-in is not recent. For anything else, write to the privacy contact in section 1. DressYou answers within one month; for a complex request the period can be extended by two more months, and DressYou tells you why within the first month.

You can complain to the [CNIL](https://www.cnil.fr/fr/plaintes) or to the supervisory authority of the EU country where you live or work.

## 8. Automated decisions

DressYou makes no decision about you with legal or similarly significant effects by automated means alone. Size answers are recommendations. Automatic screening can hold a post or comment, and a person then decides (section 2.8). Whether a refusal by the age check, or a hold by screening, is such a decision remains open (sections 2.2 and 2.8).

## 9. Age

DressYou is for people aged 18 or over. You confirm your age before capture, and an age check takes place before any photograph is processed (section 2.2).

## 10. Security

Private files are stored encrypted, in storage no other account can reach, and the links that show them expire after five minutes. Two-step verification and passkeys protect sign-in.

## 11. Cookies and similar technologies

The apps contain no analytics software; crash reports are described in section 2.11. An ask page sets one cookie, limited to that ask's pages and lasting until the link ends, so that a friend's vote can be changed and counted once. The extension stores its link to your account in your browser. <mark class="open" data-id="website-cookies"><b>Founder to decide:</b> the cookies or similar trackers the website dressyouapp.com sets, if any</mark>

## 12. Changes to this notice

When this notice changes in a way that matters, DressYou tells account holders before the change applies. <mark class="open" data-id="notice-changes"><b>Founder to decide:</b> How are account holders told of a change, and does a new version need new acceptance? Today the version accepted is recorded only at account creation.</mark>
