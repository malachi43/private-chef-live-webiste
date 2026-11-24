"""Generated blocks used inside page files. Each <!--NAME--> marker is replaced by build.py."""
import re

# ---------- Home ----------

MARQUEE = ['Party jollof', 'Ofada stew', 'Ẹ̀fọ́ riro', 'Suya', 'Egusi', 'Pepper soup', 'Grills', 'Continental', 'Small chops', 'Plant-based']


def marquee():
    run = ''.join(f'<tspan>{w}</tspan><tspan class="mq__sep" dx="18" dy="-2">✦</tspan><tspan dx="18" dy="2"></tspan>' for w in MARQUEE)
    return f'''<div class="mq" aria-label="Dishes and cuisines: {', '.join(MARQUEE)}" role="img">
  <svg class="mq__svg" viewBox="0 0 1440 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <path id="mq-path" d="M-200 190 Q 720 30 1640 190" fill="none"/>
    <path class="mq__line" d="M-200 214 Q 720 54 1640 214" fill="none"/>
    <text class="mq__text"><textPath href="#mq-path" startOffset="0">{run}{run}{run}</textPath></text>
  </svg>
</div>'''


DISHES = [
    ('cut-jollof', 'Party jollof', 'Smoky, firewood-style', 'Nigerian', '₦6,500'),
    ('cut-efo', 'Ẹ̀fọ́ riro & pounded yam', 'Rich, peppery greens', 'Yoruba', '₦7,000'),
    ('cut-fish', 'Grilled fish & plantain', 'Croaker, charred dodo', 'Grills', '₦9,500'),
    ('table-event', 'Party trays for 50', 'Small chops to dessert', 'Events', '₦380,000'),
]


def dishes():
    rows = ''
    for i, (img, name, note, tag, price) in enumerate(DISHES):
        src = f'img/{img}.webp' if img.startswith('cut-') else f'img/{img}-800.webp'
        rows += f'''<li class="dish" data-img="{src}" data-cut="{1 if img.startswith('cut-') else 0}" data-reveal>
  <span class="dish__n num">0{i + 1}</span>
  <span class="dish__thumb" aria-hidden="true"><img src="{src}" alt="" loading="lazy"></span>
  <span class="dish__name">{name}</span>
  <span class="dish__note">{note}</span>
  <span class="dish__tag">{tag}</span>
  <span class="dish__price">from <b class="num">{price}</b></span>
</li>'''
    return f'<ul class="dishes" data-dishes>{rows}</ul><div class="dish-float" aria-hidden="true"><img alt=""></div>'


TRUST = [
    ('seal-check', 'Every chef is verified', 'Government ID, food safety and business documents, reviewed by our team before a profile goes live. Verified chefs carry the green seal.',
     '<span class="chip-ui chip-ui--ok">{{f:seal-check|pc-i--sm}}Verified chef</span>'),
    ('lock-key', 'Your payment is held', 'You pay when you book, and we hold the money. The chef is paid only after your meal is done. If a chef declines, you get a full refund automatically.',
     '<span class="chip-ui">{{i:lock-key|pc-i--sm}}₦96,000 held safely</span>'),
    ('receipt', 'Every naira, upfront', 'Food, travel and service fees are all shown before you pay. No surprises at the door, no haggling on the day.',
     '<span class="chip-ui"><b>Total</b> ₦104,500 · all fees in</span>'),
    ('map-pin', 'Your address stays private', 'Chefs see your area while they decide. Your exact address is shared only once the booking is confirmed.',
     '<span class="chip-ui">{{i:map-pin|pc-i--sm}}Lekki Phase 1 · exact address hidden</span>'),
]


def trust():
    out = ''
    for i, (ic, h, p, ui) in enumerate(TRUST):
        out += f'''<li class="tcard" style="--i:{i}">
  <div class="tcard__top"><span class="tcard__ic">{{{{i:{ic}}}}}</span><span class="tcard__n num">0{i + 1} / 04</span></div>
  <h3 class="h3">{h}</h3><p>{p}</p><div class="tcard__ui">{ui}</div>
</li>'''
    return f'<ol class="tcards" data-stack>{out}</ol>'


CHEFS = [
    ('chef-amaka', 'Amaka Obi', 'Nigerian · Party jollof', '4.9', '128', '₦25,000'),
    ('chef-tunde', 'Tunde Bakare', 'Continental · Tasting menus', '4.8', '96', '₦40,000'),
    ('chef-zainab', 'Zainab Bello', 'Northern · Grills and suya', '5.0', '74', '₦20,000'),
]


def chefs():
    cards = ''
    for img, name, spec, rating, reviews, price in CHEFS:
        cards += f'''<li class="ccard js-tilt">
  <div class="ccard__img arch">{{{{pic:{img}|w=480,800|sizes=(max-width: 700px) 78vw, 420px|alt=Chef {name.split()[0]} at work}}}}</div>
  <div class="ccard__body">
    <div class="ccard__row"><h3 class="ccard__name">{name}{{{{f:seal-check|pc-i--sm ccard__seal}}}}</h3><span class="ccard__rate">{{{{f:star|pc-i--sm}}}}{rating} <small>({reviews})</small></span></div>
    <div class="ccard__row"><span class="ccard__spec">{spec}</span><span class="ccard__price">from <b class="num">{price}</b><small>/guest</small></span></div>
  </div>
</li>'''
    cards += '''<li class="ccard ccard--join">
  <div class="ccard__join g-cocoa grain"><div class="aurora" aria-hidden="true"><i></i><i></i><i></i></div>
    <span class="ccard__joinic">{{i:chef-hat|pc-i--lg}}</span>
    <h3 class="h3">Your profile could be next.</h3>
    <p>Lagos chefs: list your menus, set your prices and get booked. Free for your first 30 days.</p>
    <a class="pc-btn pc-btn--primary js-magnet" href="chefs.html">Become a chef {{i:arrow-right}}</a>
  </div>
</li>'''
    return f'<ul class="ctrack" data-ctrack>{cards}</ul>'


def expand(s):
    s = s.replace('<!--MARQUEE-->', marquee()).replace('<!--DISHES-->', dishes())
    s = s.replace('<!--TRUST-->', trust()).replace('<!--CHEFS-->', chefs())
    return s


# ---------- Inner pages ----------

def phero(eyebrow, title, lead, extra='', art='', cls=''):
    """Shared inner-page hero on Cocoa."""
    return f'''<section class="phero g-cocoa grain {cls}" data-ground="dark">
  <div class="aurora" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="wrap phero__grid">
    <div class="phero__copy">
      <span class="eyebrow" data-reveal>{eyebrow}</span>
      <h1 class="title" data-split>{title}</h1>
      <p class="lead" data-reveal>{lead}</p>
      {extra}
    </div>
    {f'<div class="phero__art" aria-hidden="true">{art}</div>' if art else ''}
  </div>
</section>'''


FAQ = {
    'Clients': [
        ('When does Private Chef launch?', "We're getting ready to launch in Lagos. Join the waitlist and we'll email you first when bookings open."),
        ("What's the difference between Chef at Home and Cook & Deliver?", 'With Chef at Home, the chef comes to your home, cooks in your kitchen and serves. With Cook & Deliver, the chef cooks in their own kitchen and delivers the meal to your door.'),
        ('How far ahead should I book?', 'Most chefs accept bookings up to 30 days ahead. For dinners, two or three days is usually enough; for parties of 20 or more, book at least a week ahead.'),
        ('Do I need to buy the ingredients?', 'No. The chef shops for fresh ingredients and the cost is included in the price you see. If you would rather supply them yourself, you can say so in your request.'),
        ('Can the chef cook for allergies or diets?', 'Yes. Add allergies and dietary needs when you book. Chefs confirm what they can do before they accept, so nothing is left to chance on the day.'),
        ('Which areas do you cover?', "We're starting across Lagos: Lekki, Victoria Island, Ikoyi, Ajah, Yaba, Surulere, Ikeja and Gbagada. Chefs choose how far they travel, so you only see chefs who can reach you."),
    ],
    'Chefs': [
        ("What does it cost to join as a chef?", 'Your first 30 days are free on every plan. After that, you pick a monthly plan that fits your business, from ₦5,000 a month.'),
        ('What do I need to get verified?', 'A government ID (NIN slip, passport or driver\'s licence), a food handler certificate or proof of food safety training, your bank details for payouts and, if you have one, your CAC registration.'),
        ('Who sets the prices?', 'You do. Price per guest, per dish or by custom quote. You can change your prices at any time; confirmed bookings keep the price agreed.'),
        ('When do I get paid?', 'Payouts are sent to your bank account within 24 hours of a completed booking.'),
        ('Can I turn down a booking?', 'Yes. You choose which requests to accept. If you decline, the client gets an automatic refund and nothing counts against you.'),
    ],
    'Payments': [
        ('How does payment work?', 'You pay securely when you book and we hold the money. The chef is paid only after your meal is done.'),
        ('What fees will I pay?', 'You see the full price before you pay: the food, any travel fee and a service fee. There is nothing extra to pay on the day.'),
        ('Can I cancel a booking?', "Yes. Every booking shows its cancellation policy before you pay, so you know exactly what's refundable and when."),
        ('Which payment methods can I use?', 'Debit and credit cards, bank transfer and USSD. Payments are processed by a licensed Nigerian payment provider.'),
    ],
    'Safety': [
        ('How are chefs verified?', 'Every chef shares a government ID and their food safety and business documents. Our team reviews them before a profile goes live, and verified chefs carry a green seal.'),
        ('Who sees my address?', 'Chefs see only your area while they decide. Your exact address is shared once the booking is confirmed.'),
        ('What if something goes wrong?', 'Report it in the app or message support. We hold the payment while we look into it, and we reply within 2 hours in support hours.'),
        ('Are reviews real?', 'Only clients with a completed booking can leave a review, so every rating comes from a real meal.'),
    ],
}


def faq_list(groups=None, limit=None, accordion=True):
    out = ''
    for g, items in FAQ.items():
        if groups and g not in groups: continue
        for q, a in items[:limit]:
            out += (f'<details class="qa" data-cat="{g}"><summary><span>{q}</span><span class="qa__ic" aria-hidden="true"></span></summary>'
                    f'<div class="qa__a"><p>{a}</p></div></details>\n')
    return f'<div class="qas"{" data-accordion" if accordion else ""}>{out}</div>'


AREAS = ['Lekki', 'Victoria Island', 'Ikoyi', 'Ajah', 'Yaba', 'Surulere', 'Ikeja', 'Gbagada', 'Somewhere else in Lagos']
CUISINES = ['Nigerian', 'West African', 'Continental', 'Grills and barbecue', 'Pastries and desserts', 'Plant-based', 'Other']
YEARS = ['Less than 2 years', '2 to 5 years', '5 to 10 years', 'More than 10 years']
TOPICS = ['A booking', 'Becoming a chef', 'Partnerships', 'Press', 'Something else']


def help_(): return '<span class="pc-field__help" hidden>{{i:warning-circle|pc-i--sm}}<span></span></span>'


def field(p, name, label, typ, ph, empty, prefix='', auto='', req=True):
    pre = f'<span class="pc-input__prefix">{prefix}</span>' if prefix else ''
    return (f'<div class="pc-field" data-empty="{empty}"><label class="pc-field__label" for="{p}-{name}">{label}</label>'
            f'<span class="pc-input">{pre}<input id="{p}-{name}" name="{name}" type="{typ}" placeholder="{ph}" autocomplete="{auto}"{" required" if req else ""}></span>{help_()}</div>')


def select(p, name, label, opts, empty, req=True):
    o = '<option value="" disabled selected>Choose one</option>' + ''.join(f'<option>{x}</option>' for x in opts)
    return (f'<div class="pc-field" data-empty="{empty}"><label class="pc-field__label" for="{p}-{name}">{label}</label>'
            f'<span class="pc-input"><select id="{p}-{name}" name="{name}"{" required" if req else ""}>{o}</select><span class="caret">{{{{i:caret-down}}}}</span></span>{help_()}</div>')


def textarea(p, name, label, ph, empty):
    return (f'<div class="pc-field" data-empty="{empty}"><label class="pc-field__label" for="{p}-{name}">{label}</label>'
            f'<span class="pc-input pc-input--area"><textarea id="{p}-{name}" name="{name}" placeholder="{ph}" required></textarea></span>{help_()}</div>')


TICK = '<svg class="tick" viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="36"/><path d="M23 37l9 9 17-19"/></svg>'


def waitlist(p, path='client', seg=True, progress=True):
    segh = f'''<div class="pc-seg wl__seg" role="group" aria-label="I am joining as" style="--n:2"><span class="pc-seg__thumb"></span>
    <button class="pc-seg__opt" type="button" aria-pressed="true">{{{{i:users|pc-i--sm}}}}Book a chef</button>
    <button class="pc-seg__opt" type="button" aria-pressed="false">{{{{i:chef-hat|pc-i--sm}}}}I'm a chef</button></div>''' if seg else ''
    return f'''<div class="wl" data-form="waitlist" data-path="{path}"{' data-fixed="chef"' if not seg else ''}>
  <div class="wl__top"><h2 class="wl__title" data-title data-client="Join the waitlist" data-chef="Apply as a chef">{"Join the waitlist" if path == "client" else "Apply as a chef"}</h2>
  {'<span class="progress" aria-hidden="true"><i></i></span>' if progress else ''}</div>
  {segh}
  <form novalidate>
    <div class="wl__fields">
      <div class="form-row">{field(p, 'name', 'Full name', 'text', 'e.g. Tolu Adebayo', 'Enter your name', auto='name')}
      {field(p, 'phone', 'Phone number', 'tel', '803 555 0142', 'Enter your phone number', prefix='+234', auto='tel-national')}</div>
      {field(p, 'email', 'Email', 'email', 'you@example.com', 'Enter your email', auto='email')}
      {select(p, 'area', 'Area in Lagos', AREAS, 'Choose your area')}
      <div class="form-row" data-for="chef"{' hidden' if path == 'client' else ''}>{select(p, 'cuisine', 'Main cuisine', CUISINES, 'Choose a cuisine', path == 'chef')}
      {select(p, 'years', 'Years of experience', YEARS, 'Choose your experience', path == 'chef')}</div>
      <button class="pc-btn pc-btn--primary pc-btn--lg pc-btn--block js-submit" type="submit" data-client="Join the waitlist" data-chef="Apply to join">{"Join the waitlist" if path == "client" else "Apply to join"} {{{{i:arrow-right}}}}</button>
      <p class="form-legal">By joining, you agree to our <a href="terms.html">Terms</a> and <a href="privacy.html">Privacy Policy</a>. We'll only contact you about Private Chef.</p>
    </div>
  </form>
  <div class="done" hidden role="status">
    {TICK}
    <h3>You're on the list.</h3>
    <p>We'll email you the moment bookings open in Lagos.</p>
    <div class="share"><span>privatechef.ng/r/tolu-4f7k</span><button class="pc-btn pc-btn--secondary pc-btn--sm js-copy" type="button">{{{{i:copy|pc-i--sm}}}}<span>Copy</span></button></div>
    <button class="pc-btn pc-btn--ghost pc-btn--sm js-again" type="button">Add someone else</button>
  </div>
</div>'''


def contact_form():
    p = 'ct'
    return f'''<div class="wl" data-form="contact">
  <div class="wl__top"><h2 class="wl__title">Send us a message</h2></div>
  <form novalidate>
    <div class="wl__fields">
      <div class="form-row">{field(p, 'name', 'Full name', 'text', 'e.g. Tolu Adebayo', 'Enter your name', auto='name')}
      {field(p, 'email', 'Email', 'email', 'you@example.com', 'Enter your email', auto='email')}</div>
      {select(p, 'topic', 'What is it about?', TOPICS, 'Choose a topic')}
      {textarea(p, 'message', 'Message', 'Tell us how we can help', 'Write your message')}
      <button class="pc-btn pc-btn--primary pc-btn--lg pc-btn--block js-submit" type="submit">Send message {{{{i:paper-plane-tilt}}}}</button>
      <p class="form-legal">We use your details only to reply. See our <a href="privacy.html">Privacy Policy</a>.</p>
    </div>
  </form>
  <div class="done" hidden role="status">{TICK}<h3>Message received.</h3><p>We'll reply soon.</p>
    <button class="pc-btn pc-btn--secondary pc-btn--sm js-again" type="button">Send another message</button></div>
</div>'''


PLANS = [
    ('Starter', '₦5,000', 'For chefs testing the waters.', ['Profile with up to 2 menus', 'Up to 8 bookings a month', 'Payouts within 24 hours', 'Chat with clients'], False),
    ('Pro', '₦12,000', 'For chefs cooking every week.', ['Unlimited menus and bookings', 'Featured in search in your area', 'Booking calendar and reminders', 'Earnings reports'], True),
    ('Business', '₦25,000', 'For teams and event caterers.', ['Everything in Pro', 'Up to 5 team members', 'Event and party quotes', 'Priority support'], False),
]


def plans():
    out = ''
    for name, price, sub, feats, star in PLANS:
        f = ''.join(f'<li>{{{{i:check|pc-i--sm}}}}{x}</li>' for x in feats)
        out += f'''<li class="plan{' plan--star g-cocoa grain' if star else ''}" data-reveal>
  {'<span class="plan__flag">Most chosen</span>' if star else ''}
  <h3 class="plan__name">{name}</h3><p class="plan__sub">{sub}</p>
  <div class="plan__price"><b class="num">{price}</b><span>a month</span></div>
  <p class="plan__free">{{{{f:sparkle|pc-i--sm}}}}First 30 days free</p>
  <ul class="plan__feats">{f}</ul>
  <a class="pc-btn {'pc-btn--primary' if star else 'pc-btn--secondary'} pc-btn--lg pc-btn--block" href="#apply">Start free</a>
</li>'''
    return f'<ul class="plans">{out}</ul>'


VERIFY = [
    ('user-circle', 'Create your profile', 'Your name, photo, cuisines and the areas you cover.', '5 minutes'),
    ('identification-card', 'Confirm your identity', 'NIN slip, international passport or driver\'s licence.', 'Have it ready'),
    ('certificate', 'Show food safety', 'A food handler certificate or proof of food safety training.', 'PDF or photo'),
    ('bank', 'Add payout details', 'Your bank account, and your CAC registration if you have one.', 'Bank account'),
    ('video-camera', 'Meet our team', 'A short video call about your cooking and how you work.', '15 minutes'),
]


def verify():
    out = ''
    for i, (ic, h, p, need) in enumerate(VERIFY):
        out += f'''<li class="vstep" data-reveal><span class="vstep__n num">{i + 1}</span>
  <div class="vstep__body"><h3 class="h3">{h}</h3><p>{p}</p></div>
  <span class="vstep__need">{{{{i:{ic}|pc-i--sm}}}}{need}</span></li>'''
    return f'<ol class="vsteps">{out}</ol>'


WEEK = [
    ('Mon', 'bell-ringing', 'A request comes in', 'Dinner for 8 in Lekki on Saturday. You see the menu, date and area.'),
    ('Mon', 'check-circle', 'You accept', 'One tap. The client has already paid, and we hold the money.'),
    ('Thu', 'chat-circle-dots', 'Plan the menu', 'Chat with the client about allergies and timing.'),
    ('Sat', 'cooking-pot', 'Cook and serve', 'Shop, cook and serve. Leave the kitchen clean.'),
    ('Sat', 'star', 'Get rated', 'The client rates the meal. Good reviews move you up in search.'),
    ('Sun', 'hand-coins', 'Get paid', 'The payout lands in your bank account within 24 hours.'),
]


def week():
    out = ''.join(f'''<li class="wk" data-reveal><span class="wk__day">{d}</span><span class="wk__dot">{{{{i:{ic}}}}}</span>
  <h3 class="wk__h">{h}</h3><p>{p}</p></li>''' for d, ic, h, p in WEEK)
    return f'<div class="week"><span class="week__line" aria-hidden="true"><i data-draw></i></span><ol class="week__list">{out}</ol></div>'


# Lagos map: stylised, not to scale. Points are placed on a 600x380 canvas.
PINS = [('Ikeja', 182, 92), ('Gbagada', 228, 150), ('Yaba', 262, 206), ('Surulere', 196, 232),
        ('Ikoyi', 338, 262), ('Victoria Island', 318, 300), ('Lekki', 432, 284), ('Ajah', 540, 272)]


def lagos_map():
    pins = ''.join(f'''<g class="pin" style="--d:{i * 90}ms" transform="translate({x} {y})"><circle class="pin__pulse" r="14"/><circle class="pin__dot" r="6"/>
  <text x="{12 if x < 500 else -12}" y="-12" text-anchor="{'start' if x < 500 else 'end'}">{n}</text></g>''' for i, (n, x, y) in enumerate(PINS))
    return f'''<svg class="lagos" viewBox="0 0 600 380" role="img" aria-label="Map of the Lagos launch areas: {', '.join(p[0] for p in PINS)}">
  <path class="lagos__land" d="M0 0H600V250C560 238 520 250 480 262C440 274 400 270 360 252C320 236 290 248 262 238C236 230 216 214 188 220C150 228 120 260 80 268C50 274 22 262 0 256Z"/>
  <path class="lagos__water" d="M0 256C22 262 50 274 80 268C120 260 150 228 188 220C216 214 236 230 262 238C290 248 320 236 360 252C400 270 440 274 480 262C520 250 560 238 600 250V318C560 304 520 312 480 316C430 322 390 324 350 318C320 314 296 320 270 330C230 344 190 340 150 336C100 330 50 340 0 346Z"/>
  <path class="lagos__shore" d="M0 346C50 340 100 330 150 336C190 340 230 344 270 330C296 320 320 314 350 318C390 324 430 322 480 316C520 312 560 304 600 318V380H0Z"/>
  <path class="lagos__bridge" d="M262 238L300 296M338 262L360 252"/>
  <path class="lagos__route" d="M182 92C200 120 214 136 228 150S256 190 262 206S300 270 318 300S380 290 432 284S510 276 540 272" pathLength="1"/>
  {pins}
  <text class="lagos__label" x="120" y="306">Lagos Lagoon</text><text class="lagos__label" x="430" y="356">Atlantic Ocean</text>
</svg>'''


# ---------- Market map (For chefs): food markets near the client, for Chef at Home shopping ----------
MARKETS = [
    # key, name, distance from client, travel, hours, known for, pin x, y, route (chef -> market -> client area)
    ('lekki', 'Lekki Market', '1.2 km', '6 min drive', 'Open until 7pm', ['Fresh fish', 'Peppers', 'Grains'], 440, 118,
     'M80 300C150 300 200 250 250 190S370 112 440 118C430 160 400 190 372 206'),
    ('ilasan', 'Ilasan Market', '1.8 km', '9 min drive', 'Open until 6pm', ['Vegetables', 'Spices', 'Palm oil'], 196, 112,
     'M80 300C96 240 130 160 196 112C236 140 266 172 290 196'),
    ('jakande', 'Jakande Market', '2.4 km', '12 min drive', 'Open until 8pm', ['Meat', 'Snails', 'Plantain'], 524, 286,
     'M80 300C200 336 380 346 524 286C474 262 424 248 388 240'),
]


def market_map():
    pins, routes, chips, data = '', '', '', ''
    for i, (k, n, d, t, h, tags, x, y, r) in enumerate(MARKETS):
        pins += (f'<g class="mm-pin" data-mm-pin="{k}" transform="translate({x} {y})">'
                 f'<circle class="mm-pin__halo" r="22"/>'
                 f'<path class="mm-pin__body" d="M0 -30c-11 0-19 8-19 19 0 14 19 31 19 31s19-17 19-31c0-11-8-19-19-19z"/>'
                 f'<path class="mm-pin__basket" d="M-8 -16h16l-2 9h-12z M-5 -16l3-6 M5 -16l-3-6"/></g>')
        routes += f'<path class="mm-route" data-mm-route="{k}" d="{r}" pathLength="1"/>'
        chips += (f'<button type="button" class="mm-chip" role="radio" aria-checked="{"true" if i == 0 else "false"}" data-mm="{k}">'
                  f'{{{{f:storefront|pc-i--sm}}}}<span><b>{n}</b><small>{d}</small></span></button>')
        tag_html = ''.join(f'<i>{x}</i>' for x in tags)
        data += (f'<template data-mm-info="{k}"><b class="mm-sheet__t">{n}</b>'
                 f'<span class="mm-sheet__m">{d} from your client · {t} · {h}</span>'
                 f'<span class="mm-sheet__tags">{tag_html}</span></template>')
    return (
        '<div class="mmap" data-mmap><div class="mmap__map">'
        '<svg class="mm" viewBox="0 0 600 460" role="img" aria-label="Map showing three food markets near a client\'s home in Lekki, '
        'with a route from the chef to the market and on to the client">'
        '<rect class="mm__ground" width="600" height="460"/>'
        '<path class="mm__water" d="M0 0H600V58C520 74 440 62 360 70S200 96 120 84 30 60 0 64Z"/>'
        '<path class="mm__park" d="M420 380c30-18 80-20 110 4s20 60-20 66-110-40-90-70z"/>'
        '<path class="mm__park" d="M40 180c24-16 64-12 74 12s-14 46-44 44-52-36-30-56z"/>'
        '<g class="mm__roads"><path d="M0 120C150 110 300 116 600 104"/><path d="M0 300C200 290 400 276 600 262"/>'
        '<path d="M110 460C140 340 150 220 170 0"/><path d="M330 460C320 330 330 200 352 0"/>'
        '<path d="M480 460C500 340 520 220 560 70"/><path d="M0 410C200 400 400 420 600 400"/></g>'
        '<g class="mm__minor"><path d="M0 210C200 200 400 196 600 186"/><path d="M240 460C250 340 236 200 262 70"/>'
        '<path d="M420 460C420 360 424 250 450 90"/></g>'
        f'{routes}'
        '<g class="mm-area"><circle class="mm-area__ring" cx="330" cy="232" r="56"/><circle class="mm-area__dot" cx="330" cy="232" r="9"/>'
        '<text class="mm-label" x="330" y="312" text-anchor="middle">Your client · approximate area</text></g>'
        '<g class="mm-chef" transform="translate(80 300)"><circle r="17"/><text class="mm-chef__t" y="5" text-anchor="middle">You</text></g>'
        f'{pins}</svg>'
        '<div class="mm-sheet glass-card" aria-live="polite"><span class="mm-sheet__ic">{{f:storefront}}</span>'
        '<div class="mm-sheet__body"></div><span class="mm-sheet__go">{{f:navigation-arrow}}<small>Start</small></span></div>'
        f'{data}</div>'
        f'<div class="mmap__chips" role="radiogroup" aria-label="Markets near your client">{chips}</div></div>'
    )


def phone(screens):
    return f'<div class="phone" aria-hidden="true"><div class="phone__notch"></div><div class="phone__screens">{screens}</div></div>'


STEPS_PHONE = '''
<div class="scr is-on" data-step="0">
  <div class="scr__bar"><b>Chefs near you</b><span>Lekki</span></div>
  <div class="scr__search">{{i:magnifying-glass|pc-i--sm}}Jollof, Saturday, 8 guests</div>
  <div class="scr__row"><img src="img/chef-amaka-480.webp" alt=""><span><b>Amaka Obi {{f:seal-check|pc-i--sm}}</b><small>Nigerian · ★ 4.9</small></span><em>₦25k</em></div>
  <div class="scr__row"><img src="img/chef-zainab-480.webp" alt=""><span><b>Zainab Bello {{f:seal-check|pc-i--sm}}</b><small>Northern · ★ 5.0</small></span><em>₦20k</em></div>
  <div class="scr__row"><img src="img/chef-tunde-480.webp" alt=""><span><b>Tunde Bakare {{f:seal-check|pc-i--sm}}</b><small>Continental · ★ 4.8</small></span><em>₦40k</em></div>
</div>
<div class="scr" data-step="1">
  <div class="scr__bar"><b>Your booking</b><span>Step 2 of 3</span></div>
  <div class="scr__card"><small>Chef at Home</small><b>Saturday 14 Nov · 7:00pm</b><span>8 guests · Party jollof menu</span></div>
  <div class="scr__line"><span>Food, 8 guests</span><b>₦88,000</b></div>
  <div class="scr__line"><span>Travel</span><b>₦4,000</b></div>
  <div class="scr__line"><span>Service fee</span><b>₦4,000</b></div>
  <div class="scr__line scr__line--total"><span>Total</span><b>₦96,000</b></div>
</div>
<div class="scr" data-step="2">
  <div class="scr__bar"><b>Payment</b><span>Secure</span></div>
  <div class="scr__held">{{f:lock-key}}<b>₦96,000 held safely</b><small>Amaka is paid after your meal is done</small></div>
  <div class="scr__chip">{{f:check-circle|pc-i--sm}}Chef confirmed</div>
  <div class="scr__chip">{{i:map-pin|pc-i--sm}}Address shared with Amaka</div>
</div>
<div class="scr" data-step="3">
  <div class="scr__bar"><b>How was dinner?</b><span>Saturday</span></div>
  <div class="scr__rate"><img src="img/chef-amaka-480.webp" alt=""><b>Rate Amaka</b><span class="scr__stars">{{f:star}}{{f:star}}{{f:star}}{{f:star}}{{f:star}}</span></div>
  <div class="scr__quote">"The jollof was the talk of the night."</div>
  <div class="scr__chip scr__chip--ok">{{f:check-circle|pc-i--sm}}Payment released to Amaka</div>
</div>'''


APP_PHONE = '''
<div class="scr is-on">
  <div class="scr__bar"><b>Good evening, Tolu</b><span>{{i:bell|pc-i--sm}}</span></div>
  <div class="scr__hero"><small>Tonight in Lekki</small><b>12 chefs available</b></div>
  <div class="scr__row"><img src="img/chef-amaka-480.webp" alt=""><span><b>Amaka Obi {{f:seal-check|pc-i--sm}}</b><small>Nigerian · ★ 4.9</small></span><em>₦25k</em></div>
  <div class="scr__row"><img src="img/chef-tunde-480.webp" alt=""><span><b>Tunde Bakare {{f:seal-check|pc-i--sm}}</b><small>Continental · ★ 4.8</small></span><em>₦40k</em></div>
  <div class="scr__tabs"><span class="is-on">{{f:house|pc-i--sm}}</span><span>{{i:magnifying-glass|pc-i--sm}}</span><span>{{i:calendar-blank|pc-i--sm}}</span><span>{{i:user|pc-i--sm}}</span></div>
</div>'''


LEGAL = {
    'terms': [
        ('About these terms', 'These terms cover your use of the Private Chef website and app, run by C-ZUCHI GLOBAL SERVICES LIMITED in Lagos, Nigeria. By creating an account or making a booking, you agree to them.'),
        ('Who we are', 'Private Chef is a marketplace. We connect clients with independent chefs and handle booking and payment. Chefs are not our employees; each chef is responsible for the food they cook and the service they give.'),
        ('Your account', 'You must be 18 or older and give accurate details. Keep your login safe; you are responsible for what happens in your account.'),
        ('Bookings', 'A booking is confirmed when the chef accepts your request and your payment succeeds. The booking page shows the menu, date, guests, total price and cancellation policy before you pay.'),
        ('Payments and fees', 'You pay the full price when you book. We hold the payment and release it to the chef after the booking is complete. Prices include food, any travel fee and our service fee.'),
        ('Cancellations and refunds', 'If a chef declines or cancels, you receive a full refund. If you cancel, the refund follows the policy shown on your booking. Refunds return to your original payment method within 5 to 10 working days.'),
        ('Chefs', 'Chefs must pass verification, keep their documents current and follow food safety law. Chef plans are billed monthly after a 30-day free period and can be cancelled at any time.'),
        ('Reviews and conduct', 'Reviews must be honest and based on a real booking. We remove content that is abusive, false or unlawful, and may suspend accounts that break these terms.'),
        ('Liability', 'We work to keep the platform safe and available, but we are not liable for losses caused by a chef or client beyond what the law allows. Nothing here limits rights you have under Nigerian consumer law.'),
        ('Changes and contact', 'We may update these terms and will tell you about important changes before they apply. Questions: {{c:email}}.'),
    ],
    'privacy': [
        ('Our approach', 'We collect only what we need to run bookings safely, and we never sell your personal data. This policy follows the Nigeria Data Protection Act 2023.'),
        ('What we collect', 'Your name, phone number, email and area; your address once you book; booking and payment records; messages with chefs; and, for chefs, identity and verification documents.'),
        ('How we use it', 'To create your account, match you with chefs, process payments, keep the platform safe, provide support and, if you agree, send you news about Private Chef.'),
        ('Who we share it with', 'Your chef sees your area while deciding and your exact address once a booking is confirmed. Payment providers process payments. We share data with authorities only when the law requires it.'),
        ('How long we keep it', 'Account data is kept while your account is open. Booking and payment records are kept for 6 years for tax and legal reasons. Waitlist details are deleted if we don\'t launch in your area within 12 months.'),
        ('Your rights', 'You can ask to see, correct, export or delete your data, and you can withdraw consent for marketing at any time. Email {{c:email}} and we will reply within 30 days.'),
        ('Security', 'Data is encrypted in transit and at rest. Payment card details are handled by our payment provider and never stored by us.'),
        ('Cookies', 'The website uses essential cookies to work and, with your consent, analytics cookies to improve it.'),
        ('Contact', 'Data protection questions: {{c:email}}. Private Chef, C-ZUCHI GLOBAL SERVICES LIMITED, Lagos, Nigeria.'),
    ],
}


def legal(kind):
    secs = LEGAL[kind]
    toc = ''.join(f'<li><a href="#s{i + 1}">{h}</a></li>' for i, (h, _) in enumerate(secs))
    body = ''.join(f'<section id="s{i + 1}" class="legal__sec"><h2>{i + 1}. {h}</h2><p>{p}</p></section>' for i, (h, p) in enumerate(secs))
    other = ('privacy', 'Privacy policy', 'How we collect, use and protect your data.') if kind == 'terms' else ('terms', 'Terms of use', 'The rules for using Private Chef as a client or a chef.')
    nxt = (f'<a class="legal__next" href="{other[0]}.html"><span><small>Also read</small><b>{other[1]}</b><em>{other[2]}</em></span>'
           '{{i:arrow-right}}</a>')
    return (f'<div class="legal__grid"><aside class="legal__side">{legal_switch(kind)}<nav class="legal__toc" aria-label="On this page"><h2>On this page</h2><ol>{toc}</ol></nav></aside>'
            f'<div class="legal__body">{body}{nxt}</div></div>')


def legal_switch(kind):
    """Pill switch between the two legal pages, shown in the hero and in the sticky side column."""
    tabs = [('terms', 'Terms of use'), ('privacy', 'Privacy policy')]
    links = ''.join(f'<a class="lswitch__opt" href="{k}.html"{" aria-current=page" if k == kind else ""}>{t}</a>' for k, t in tabs)
    return f'<nav class="lswitch" aria-label="Legal pages" style="--i:{0 if kind == "terms" else 1}"><span class="lswitch__thumb" aria-hidden="true"></span>{links}</nav>'


_old_expand = expand


def expand(s):
    s = _old_expand(s)
    s = re.sub(r'<!--FAQ:([^:>]*):?(\d*)-->', lambda m: faq_list(m.group(1).split(',') if m.group(1) != 'all' else None, int(m.group(2)) if m.group(2) else None), s)
    s = re.sub(r'<!--WAITLIST:(\w+):(\w+)(:noseg)?-->', lambda m: waitlist(m.group(1), m.group(2), seg=not m.group(3)), s)
    s = s.replace('<!--CONTACTFORM-->', contact_form()).replace('<!--PLANS-->', plans()).replace('<!--VERIFY-->', verify())
    s = s.replace('<!--WEEK-->', week()).replace('<!--MAP-->', lagos_map()).replace('<!--MARKETMAP-->', market_map())
    s = s.replace('<!--PHONE:steps-->', phone(STEPS_PHONE)).replace('<!--PHONE:app-->', phone(APP_PHONE))
    s = re.sub(r'<!--LEGAL:(\w+)-->', lambda m: legal(m.group(1)), s)
    s = re.sub(r'<!--LSWITCH:(\w+)-->', lambda m: legal_switch(m.group(1)), s)
    s = re.sub(r'<!--PHERO\|(.*?)-->', lambda m: phero(*[x.strip() for x in m.group(1).split('|')]), s, flags=re.S)
    s = s.replace('[[CTA]]', '<!--CTA-->').replace('[[APPS]]', '<!--APPS-->')
    s = re.sub(r'\[\[BADGE:([^\]]*)\]\]', lambda m: '<!--BADGE:' + m.group(1) + '-->', s)
    s = re.sub(r'\[\[PHONE:(\w+)\]\]', lambda m: phone(STEPS_PHONE if m.group(1) == 'steps' else APP_PHONE), s)
    return s
