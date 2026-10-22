// Fallback content, used when the Payload CMS is not configured or unreachable.
// The CMS is the source of truth once PAYLOAD_URL is set.
export type BlogBlock = { heading?: string; text?: string };

export type FallbackPost = {
  slug: string;
  category: string;
  title: string;
  date: string;
  intro: string;
  series?: string | null;
  prev?: { slug: string; title: string } | null;
  next?: { slug: string; title: string } | null;
  content: BlogBlock[];
  publishedAt: string;
  tags: string[];
  featured: boolean;
};

export const fallbackPosts: FallbackPost[] = [
  {
    "slug": "what-killed-the-ai-pin",
    "category": "Personal Context Infrastructure",
    "title": "What Killed the AI Pin: A Post-Mortem on Humane, Rabbit, and the Wearable Wave",
    "date": "Aug 11, 2026",
    "intro": "Humane, Rabbit and the wearable AI wave did not fail only because of poor execution. They were built on the wrong input layer: ambient voice.",
    "series": "Part of a series on the Personal Context Infrastructure field.",
    "prev": {
      "slug": "ai-that-knows-you",
      "title": "Why Every Attempt at “AI That Knows You” Has Bet on the Wrong Layer"
    },
    "next": null,
    "content": [
      {
        "text": "The year 2023 looked, briefly, like the beginning of something."
      },
      {
        "text": "Humane — founded by two former Apple designers, backed by $230 million from investors including Sam Altman — unveiled the AI Pin at a Paris fashion show. It clipped to your chest like a brooch. A laser projected information onto your palm. It was meant to be, in the company’s words, “a new relationship with technology.”"
      },
      {
        "text": "Twelve months later, Humane sold to HP for a fraction of its valuation. The AI Pin was discontinued. Users who’d paid $699 plus a monthly subscription were told their device would stop working."
      },
      {
        "text": "The Rabbit R1 — a $199 orange plastic device with an eye-catching design and a concept called the “Large Action Model” — sold out its first batch in 24 hours on the strength of a viral CES announcement. Reviewers discovered it couldn’t reliably do what was demonstrated on stage. Within months, one developer had shown that its entire functionality could be replicated as a smartphone app."
      },
      {
        "text": "Limitless, which made a recording pendant for meetings, was acquired by Meta. Bee, another conversation-capture wearable, was acquired by Amazon. Neither acquisition was celebratory — both read as acqui-hires, the products quietly wound down."
      },
      {
        "text": "The wearable AI moment arrived, generated enormous press, and evaporated."
      },
      {
        "heading": "What actually happened?"
      },
      {
        "heading": "The Autopsies Were Right, and They Missed the Point"
      },
      {
        "text": "The product-specific explanations for each failure are accurate."
      },
      {
        "text": "The AI Pin overheated. Its laser projector was nearly invisible in daylight. Its response times were too slow for a device that replaced a phone. At $699 plus $24 a month, it cost as much as a smartphone while doing a fraction of what a smartphone does."
      },
      {
        "text": "The Rabbit R1’s core concept — a model that learns to operate apps on your behalf — was architecturally sound as a long-term vision and completely unbuilt at launch. The device that shipped was a voice interface to a handful of APIs, wrapped in hardware nobody needed."
      },
      {
        "text": "The meeting-recording pendants (Limitless, Bee, Omi) solved a real problem — capturing what was said in conversations — but discovered that most people either didn’t want a recording device visibly around their neck, or were surrounded by colleagues who didn’t want to be recorded, or both."
      },
      {
        "text": "Each of these failures is real. But notice what they all have in common beyond their individual problems: they are all failures of execution around a shared premise. The premise itself went unexamined."
      },
      {
        "heading": "The Premise Nobody Questioned"
      },
      {
        "text": "Every ambient wearable was built on the same assumption: that the right input layer for personal AI is the body."
      },
      {
        "text": "Specifically, audio from the body. A microphone worn on or near the person, capturing what they say and what is said around them, feeding that stream into AI systems that would extract meaning, surface memory, and provide assistance."
      },
      {
        "text": "This premise has a seductive logic. The AI learns from what you do and say, continuously, without requiring you to do anything deliberate. Zero friction. Ambient intelligence. The computer that disappears into your life rather than demanding your attention."
      },
      {
        "text": "The problem is that most of a person’s real context is not acoustic."
      },
      {
        "text": "Think about the information that actually shapes your decisions and thinking. The articles you read late at night and bookmarked. The product page you saved before you bought something. The notes app entry you made three days ago that you still haven’t processed. The photo of the whiteboard from the meeting where everything changed. The reading highlight from the book you finished last month. The link someone sent you that you forwarded to yourself to deal with later and never did."
      },
      {
        "text": "None of that is captured by a microphone. None of it appears in a transcript. The ambient wearable, by definition, misses all of it."
      },
      {
        "text": "The wearables were capturing the wrong signal. Voice is what you say. Context is what you know. These overlap far less than the premise assumed."
      },
      {
        "heading": "The Capture Problem That Was Already Solved"
      },
      {
        "text": "Here is the other thing the post-mortems tend to miss: active capture — saving information for later retrieval — had already been solved before any of these products launched."
      },
      {
        "text": "Not elegantly, not perfectly, but functionally. The share sheet. The notes app. The reading list. The screenshot. The action button. Voice memos. Every major productivity app built a save-to integration. Every browser built a way to clip and store."
      },
      {
        "text": "The result is that most people with a smartphone are already capturing enormous amounts of context, every day, without effort. The friction of capture had already dropped to something like two or three seconds for most common cases."
      },
      {
        "text": "The wearables were racing to solve a problem that had largely been solved, using a method (ambient voice) that captured less valuable information than what people were already capturing deliberately."
      },
      {
        "text": "The friction problem was real. They just identified the wrong friction."
      },
      {
        "heading": "What Was Missing, and Still Is"
      },
      {
        "text": "The actual unsolved problem isn’t capturing more. It’s making sense of what’s already been captured."
      },
      {
        "text": "Most people have years of saved links they’ve never returned to. Notes apps with hundreds of entries, never searched. Screenshots that live in the camera roll with no retrievable label. Voice memos that describe something important from eighteen months ago, indistinguishable in the list from a grocery note."
      },
      {
        "text": "The captured material exists. The intelligence to make it useful doesn’t."
      },
      {
        "text": "That’s a different product category than an ambient wearable. It’s not a capture device. It’s an organizing layer — software that sits over what you’re already saving, understands it well enough to surface what’s relevant when you need it, and can hand context safely to the AI tools you’re actually using day to day."
      },
      {
        "text": "The wearable companies had the right instinct — AI that knows you, context that follows you — and the wrong layer. They built hardware when the gap was software. They listened when the problem was organization."
      },
      {
        "heading": "The Lesson Is Not “AI Wearables Are Impossible”"
      },
      {
        "text": "It would be easy to read this post-mortem as evidence that AI ambient computing is a dead end. That’s not the argument."
      },
      {
        "text": "The argument is more precise: the ambient wearables bet on voice as the primary channel for personal context, and voice is the wrong channel because it’s too narrow and it misses too much. A wearable that solved the right problem — exposing the full range of what a person actually saves and thinks about, across all their apps, in a trusted way — would be genuinely useful. Nobody has built that yet."
      },
      {
        "text": "What’s been built, and failed, is the premise that listening to air around you is a useful proxy for understanding who you are and what you care about."
      },
      {
        "text": "It isn’t. The information that matters most about you isn’t being spoken. It’s being saved."
      }
    ],
    "publishedAt": "2026-08-11T09:00:00.000Z",
    "tags": [
      "AI wearables",
      "Humane",
      "Rabbit",
      "post-mortem"
    ],
    "featured": true
  },
  {
    "slug": "ai-that-knows-you",
    "category": "Personal Context Infrastructure",
    "title": "Why Every Attempt at “AI That Knows You” Has Bet on the Wrong Layer",
    "date": "Jul 24, 2026",
    "intro": "AI wearables focused on listening, but most personal context already lives in screenshots, links, notes and saved media. The missing layer is personal context infrastructure.",
    "series": "This is the first article in a series exploring Personal Context Infrastructure—the emerging category between AI wearables, cloud storage and personal knowledge-management tools.",
    "prev": null,
    "next": {
      "slug": "what-killed-the-ai-pin",
      "title": "What Killed the AI Pin: A Post-Mortem on Humane, Rabbit, and the Wearable Wave"
    },
    "content": [
      {
        "text": "In 2023, Humane shipped the AI Pin — a wearable that clipped to your shirt and listened. Rabbit shipped the R1 — a pocket device that listened differently. Limitless shipped a pendant. Bee shipped a clip. Omi shipped an earpiece. Friend shipped... a friend."
      },
      {
        "text": "Every one of these products made the same fundamental bet: the right layer for personal AI is hardware you wear, capturing through voice."
      },
      {
        "text": "That bet has largely failed."
      },
      {
        "text": "The Humane AI Pin was returned en masse and the company sold off. The Rabbit R1 became a cautionary tale about shipping without a foundation. Limitless was absorbed into Meta. Bee was absorbed into Amazon. The wearable wave crested and broke faster than almost anyone predicted."
      },
      {
        "text": "The common autopsy says: bad execution, wrong price points, insufficient AI capability. These diagnoses are accurate. But they miss the structural problem underneath."
      },
      {
        "text": "The bet itself was wrong."
      },
      {
        "heading": "Why Voice Is The Wrong Layer"
      },
      {
        "text": "Voice is a narrow channel."
      },
      {
        "text": "A typical person speaks roughly 16,000 words per day. Some of that is genuinely context-rich — a conversation with a colleague about a real decision, a call with a doctor, a meeting where strategy actually gets made. Most of it is ambient noise: pleasantries, orders at coffee shops, half-sentences to nobody in particular."
      },
      {
        "text": "But the more fundamental problem is what never gets spoken at all."
      },
      {
        "text": "The article you bookmarked at midnight because it reframed something you’d been thinking about for months. The screenshot of a product page you saved three days before buying. The voice memo you recorded while driving home because something clicked. The notes app entry that started as four words and never got finished. The photo of the whiteboard from the meeting where everything changed."
      },
      {
        "text": "None of that goes through voice. None of it appears in a transcript. None of it gets captured by a device listening to the air around you."
      },
      {
        "text": "Most of what constitutes your real context — your actual interests, your decisions, your evolving understanding, your open questions — lives in silent, fragmented, already-saved form across the apps on your phone."
      },
      {
        "text": "The wearables weren’t capturing what you know. They were capturing what you say. These are not the same thing."
      },
      {
        "heading": "The Layer That Was Already There"
      },
      {
        "text": "The phone is already the default capture surface for human context."
      },
      {
        "text": "Not by design, exactly. Nobody at Apple or Google sat down and decided to build the world’s best personal context repository. It happened by accumulation. The camera became the best camera. Notes became frictionless. The share sheet made it easy to save anything from anywhere. The action button made capture faster still. Every productivity app built a share extension. Every browser built a reading list."
      },
      {
        "text": "The result is that most of what a person saves, thinks, and researches now lives on one device. Links, screenshots, voice memos, notes, bookmarks, reading highlights, calendar entries, reminders, photos of documents. The raw material of a person’s intellectual life is already there, already captured."
      },
      {
        "text": "What is not there — what has never been there — is an organizing intelligence on top of it."
      },
      {
        "text": "That is the missing layer."
      },
      {
        "text": "Not more hardware. Not better microphones. Not a pendant that listens while you sleep. An intelligence layer over what you are already saving, paired with the trust architecture to hand that context to AI safely — without handing over everything, without losing control of where it lives."
      },
      {
        "heading": "This is a Category Problem, Not a Feature Problem"
      },
      {
        "text": "The reason this keeps getting framed as a hardware problem — or an AI problem, or a UX problem — is that the category itself hasn’t been clearly named yet."
      },
      {
        "text": "“Second brain” tools like Obsidian, Notion, and Roam got close to naming it. But they required too much deliberate input. You had to choose to organize, choose to link, choose to maintain. The tools became a second job instead of a second brain. Most people who started using them stopped."
      },
      {
        "text": "Cloud storage providers got a different piece of it. Google Drive, iCloud, and Dropbox solved the “where does this live” problem adequately. They never touched the “what does it mean and how do I use it” problem at all."
      },
      {
        "text": "Ambient wearables tried to solve the capture problem in a way that didn’t require deliberate input — passive listening as a workaround for the friction of active saving. But they solved the wrong capture problem. Active saving had already been solved. The phone had solved it."
      },
      {
        "text": "The category that’s missing is what you might call personal context infrastructure: a layer that sits over what you’re already saving, makes it legible and searchable, understands it well enough to assist you — and exposes it safely to the external AI tools you’re using, only on your terms."
      },
      {
        "text": "This is not a note-taking app with better AI. It’s not cloud storage with smarter search. It’s not a wearable that works. It’s a new category, positioned against all three of those at once."
      },
      {
        "heading": "Why Now"
      },
      {
        "text": "Three things changed at roughly the same time that make this category buildable today in a way it wasn’t in 2022."
      },
      {
        "text": "First, large language models became capable enough to reason over personal, heterogeneous data — not just structured databases, but the messy, mixed-format reality of what actually lives in someone’s saved files."
      },
      {
        "text": "Second, on-device AI matured enough to handle significant processing locally. Which means the trust question — does this company have all my private notes? — has a credible architectural answer for the first time."
      },
      {
        "text": "Third, MCP (the Model Context Protocol) created a standard mechanism for exposing structured context to external AI agents. Personal context infrastructure now has an interoperability layer to build toward, not just a private silo to build into."
      },
      {
        "text": "The hardware bets on ambient wearables were, in part, premature. The category they were trying to serve is real. The layer they chose to build on was wrong, and the infrastructure to do it right didn’t fully exist yet."
      },
      {
        "text": "Both of those conditions have changed."
      }
    ],
    "publishedAt": "2026-07-24T09:00:00.000Z",
    "tags": [
      "personal context",
      "AI wearables",
      "category"
    ],
    "featured": false
  }
];

export function getFallbackPost(slug: string): FallbackPost | undefined {
  return fallbackPosts.find((post) => post.slug === slug);
}
