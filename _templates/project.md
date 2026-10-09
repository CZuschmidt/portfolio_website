---
# =============================================================================
#  PROJECT TEMPLATE
#
#  HOW TO ADD A NEW PROJECT
#    1. Copy this file into the _projects/ folder.
#    2. Rename it. The file name becomes the page address:
#         _projects/line-follower-robot.md  →  /projects/line-follower-robot/
#       Use lowercase letters, numbers and hyphens only.
#    3. Put the project's images in a new folder:
#         assets/img/projects/line-follower-robot/
#    4. Fill in the fields below and write the page in Markdown underneath
#       the closing --- line.
#    5. Commit and push. The project appears on the home page automatically,
#       sorted by `date` (newest first).
#
#  Optional fields can be deleted entirely; anything left out is not shown.
#  To hide a project without deleting it, add the line:  published: false
#  (This _templates folder is never published, so this file won't show up.)
# =============================================================================

title: "Project Title"
date: 2026-01-15                 # YYYY-MM-DD. Controls the order on the home page.
category: "Embedded Systems"     # optional, short label shown above the title
summary: >-
  One or two sentences describing what you built and why. Shown on the
  project card and at the top of the project page.

# Main image: shown on the card (cropped to 16:10) and at the top of the page.
# Replace the placeholder path with your own image, e.g.
#   "/assets/img/projects/line-follower-robot/cover.jpg"
image: "/assets/img/placeholder.svg"
image_alt: "Describe what the image shows"
image_caption: "Optional caption under the main image"   # optional

# Shown as tags. The card shows the first four.
skills: ["KiCad", "STM32", "C", "Oscilloscope"]

role: "Hardware and firmware"    # optional
team: "Solo project"             # optional, e.g. "3 students"
duration: "6 weeks"              # optional

# Optional links in the sidebar. Entries with an empty url are hidden.
links:
  - label: "Source code"
    url: ""                      # e.g. "https://github.com/CZuschmidt/repo-name"
  - label: "Report (PDF)"
    url: ""                      # e.g. "/assets/files/line-follower-report.pdf"

# Optional image grid shown at the end of the page. Delete if not needed.
gallery:
  - src: "/assets/img/placeholder.svg"
    alt: "Describe the image"
    caption: "Caption"
  - src: "/assets/img/placeholder.svg"
    alt: "Describe the image"
    caption: "Caption"
---

## Overview

What problem did this project solve, and what were the requirements?

## Design

How did you approach it? Explain key decisions and trade-offs. To add an
image anywhere in the text, use:

{% include figure.html src="/assets/img/placeholder.svg" alt="Describe the image" caption="Caption for the image." %}

Tables work well for specifications and measurements:

| Parameter     | Target | Measured |
| ------------- | ------ | -------- |
| Input voltage | 12 V   | 12.1 V   |
| Efficiency    | > 85 % | 88 %     |

## Results

What worked, what you measured, and how it compared to your goals.

## What I would change

Lessons learned and next steps.
