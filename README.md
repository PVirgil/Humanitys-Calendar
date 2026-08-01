# Humanity's Calendar — The Human Record

> **Human history, explored as one continuous timeline.**

Humanity's Calendar is an interactive chronological experience designed to make the most important moments in humanity's story explorable in a single interface.

Rather than organizing history into articles, chapters, or a traditional 12-month calendar, Humanity's Calendar treats **time itself as the interface**.

Users can move through the timeline, zoom between different historical scales, search for important moments, filter events by category, and open individual events to learn more about them.

The goal is simple:

**Make exploring history feel as intuitive as exploring a map.**

---

## What is Humanity's Calendar?

Most historical resources require you to already know what you're looking for.

Humanity's Calendar takes a different approach.

It presents history spatially and chronologically, allowing you to move through time and discover events in context.

Instead of:

> Search → Article → Back → Search → Article

the experience becomes:

> Explore → Zoom → Discover → Understand → Keep exploring

The timeline stretches across enormous differences in scale—from the formation of Earth and emergence of life to civilizations, scientific discoveries, political transformations, technological breakthroughs, and the modern world.

---

## The Core Idea

Humanity's Calendar is inspired by the way modern mapping and calendar applications reveal information as you move and zoom.

At a broad scale, only civilization-defining events need to be visible.

As the timeline becomes more focused, additional historical moments can emerge.

This creates a form of **semantic zoom**:

- Huge time scales emphasize the rarest and most consequential events.
- Historical eras reveal civilizations and major transformations.
- Centuries reveal discoveries, conflicts, movements, and cultural changes.
- Decades and years provide increasingly detailed historical context.

The result is a timeline that can contain enormous amounts of information without displaying everything at once.

---

## Exploring the Timeline

### Travel Through Time

The timeline is continuous rather than divided into pages.

Drag horizontally to move backward or forward through history.

Events maintain permanent positions around the central chronological axis, creating a consistent visual structure as the timeline moves.

### Zoom

Zooming changes the amount of history visible at once.

At wider scales, less significant events are hidden to keep the interface readable.

Zooming closer reveals additional events.

This allows the same interface to represent extremely different historical scales without becoming an unreadable wall of information.

### Search

The search system can locate events using information such as:

- Event names
- Historical figures
- Locations
- Categories
- Descriptions
- Keywords and tags

Selecting a result moves the timeline directly to that moment.

### Filters

Events can be explored by category, including areas such as:

- Civilization
- Science
- Technology
- Politics
- Religion
- Medicine
- Exploration
- Culture
- Conflict
- Humanity
- Origins

This makes it possible to explore history through a particular lens while preserving chronological context.

---

## Event Markers

Historical moments appear as circular markers connected to the central timeline.

The markers follow a deliberate repeating pattern:

**Below → Above → Below → Above**

while cycling through three different distances from the timeline.

This creates a structured visual rhythm that gives event titles room to breathe while keeping the interface predictable.

An event's placement is permanent. Moving or zooming the timeline does not cause that event to suddenly jump from one side to another.

Every marker is also designed as an interactive target for both mouse and touch input.

---

## Event Details

Selecting an event opens its full information panel without taking the user away from the timeline.

An event can contain:

- Title
- Date
- Historical category
- Summary
- Extended description
- Location
- Important people
- Keywords
- Historical significance score
- Reference material

This keeps exploration continuous: users can investigate an event and then immediately return to the historical context surrounding it.

---

## Historical Significance

Events include a **significance score from 0–100**.

This is not intended to declare an objective mathematical ranking of history.

Instead, significance acts primarily as an information-management tool.

At enormous timeline scales, only extremely significant events should remain visible. As the user zooms closer, the threshold decreases and more events become available.

For example, a civilization-changing development may remain visible across centuries or millennia, while a more specific event may appear only when viewing the relevant period closely.

Historical significance is inherently interpretive and should therefore be treated as an editorial judgment rather than an absolute measurement.

---

## Historical Dates and Uncertainty

History is not always precise.

Ancient and prehistoric events may have:

- Approximate dates
- Disputed dates
- Date ranges
- Competing interpretations
- Limited surviving evidence

Humanity's Calendar should not create a false impression of certainty simply because events appear on a precise-looking timeline.

Negative years in the underlying dataset represent BCE dates, while positive years represent CE dates.

For extremely ancient events, the interface automatically represents time using larger units such as thousands, millions, or billions of years.

As the project grows, representing historical uncertainty explicitly is an important part of preserving the integrity of the timeline.

---

## A Timeline Larger Than Humanity

Despite the name *The Human Record*, the story begins before humans.

Understanding humanity requires understanding what made humanity possible.

The timeline can therefore extend through:

**God's Creation of Earth → earliest life → evolution of complex organisms → Homo sapiens → agriculture → cities → writing → civilizations → science → industry → computing → the modern world**

This creates continuity between natural history and human history rather than treating civilization as though it appeared without context.

---

## Design Philosophy

Humanity's Calendar is intentionally different from a conventional encyclopedia.

The interface is designed around several principles.

### Time Comes First

Chronology is not metadata attached to an article.

Chronology **is the structure of the application**.

### Exploration Before Navigation

Users should be able to discover something important without knowing its name beforehand.

### Context Matters

An event becomes more meaningful when you can immediately see what happened before it, what happened afterward, and what else was occurring around the same period.

### Complexity Should Appear Gradually

A timeline containing thousands or eventually millions of events cannot display everything simultaneously.

Information should emerge as the user moves closer to it.

### History Should Feel Alive

Movement, scale, interaction, visual hierarchy, and spatial relationships are used to make historical exploration feel dynamic rather than static.

---

## Mobile Experience

Humanity's Calendar is designed for both desktop and touch-based devices.

Mobile interactions include larger invisible touch targets around event markers so the interface remains easy to use without making the visible markers oversized.

The mobile timeline also reduces the number of chronological labels displayed along the axis. This prevents dates from overlapping while preserving the actual scale and position of historical events.

The underlying timeline remains the same experience rather than becoming a separate simplified mobile version.

---

## Current Data Structure

Historical events are represented as structured objects.

Example:

```js
{
  id: "moon",
  year: 1969,
  month: 7,
  day: 20,
  title: "Apollo 11 Moon landing",
  summary: "Humans walk on another world for the first time.",
  description:
    "Neil Armstrong and Buzz Aldrin landed in the lunar module Eagle while Michael Collins remained in orbit. The mission represented an extraordinary convergence of science, engineering, state capacity, and Cold War competition.",
  category: "Exploration",
  significance: 98,
  location: "Sea of Tranquility, Moon",
  people: ["Neil Armstrong", "Buzz Aldrin", "Michael Collins"],
  tags: ["Moon", "Apollo", "NASA", "space"]
}
