# Portfolio website

An electrical engineering portfolio built with [Jekyll](https://jekyllrb.com/), which GitHub Pages builds automatically. You don't need to install anything: edit a file on GitHub, commit, and the site updates within a minute or two.

Every piece of example text starts with **"Placeholder"**. Search the repository for that word to find everything you still need to replace.

---

## Where everything lives

| What you want to change              | File                                   |
| ------------------------------------ | -------------------------------------- |
| Name, headline, intro line, links    | `_config.yml`                          |
| About text                           | `index.md`                             |
| Skills table under About             | `_data/skills.yml`                     |
| Projects (one file per project)      | `_projects/`                           |
| Courses                              | `_data/courses.yml`                    |
| Activities                           | `_data/activities.yml`                 |
| Your photo, project images           | `assets/img/`                          |
| Résumé and other PDFs                | `assets/files/` (create the folder)    |
| Colours, fonts, spacing              | `assets/css/main.css` (tokens at the top) |

You don't need to edit anything in `_layouts/` or `_includes/` to add content.

---

## Common tasks

### Add a project

1. Copy `_templates/project.md` into `_projects/` and rename it, e.g. `_projects/line-follower-robot.md`.
   The file name becomes the page address: `/projects/line-follower-robot/`.
2. Create a folder for its images: `assets/img/projects/line-follower-robot/`.
3. Fill in the fields at the top of the file (title, date, summary, image, skills, …) and write the page underneath in Markdown.
4. Commit. The project shows up in the home page grid automatically, newest `date` first.

The template file explains every field. To add an image inside the text of a project page:

```liquid
{% include figure.html src="/assets/img/projects/line-follower-robot/board.jpg" alt="Assembled PCB" caption="Rev B board after assembly." %}
```

Clicking any project image opens a larger view. This is useful for schematics.

To hide a project without deleting it, add `published: false` to its front matter.
To remove the example projects, delete the three `example-*.md` files in `_projects/`.

### Add a course or activity

Open `_data/courses.yml` or `_data/activities.yml`. The top of each file has a block marked **copy from here … to here**. Paste a copy where you want the new item to appear and fill it in. Keep the indentation exactly as in the examples, because YAML depends on it.

### Replace placeholder images

- **Project images:** set `image:` (and the `gallery:` entries) in the project file to your own image path. Any size works. Cards crop images to 16:10, so a landscape photo or render works best.
- **Portrait:** put your photo in `assets/img/` and set `photo:` in `_config.yml`. Set it to `""` to hide the photo.
- **Share preview image** (`assets/img/og-image.png`, 1200×630): this is shown when the link is posted on LinkedIn, Slack and similar sites. Replace it with any 1200×630 image, or edit `tools/og-image.html` and run `node tools/render-images.mjs` (requires Node and Playwright).

### Add contact links

In `_config.yml`, fill in the `url` for Email (`mailto:you@example.com`), LinkedIn or Résumé. A link with an empty `url` is not shown anywhere, so the site never has links that go nowhere.

---

## Publishing on GitHub Pages

1. Merge this branch into `main`.
2. On GitHub, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, branch **`main`**, folder **`/ (root)`**, and save.
4. The site will be at **https://czuschmidt.github.io/cz_portfolio/**.

If you rename the repository to `CZuschmidt.github.io`, the site moves to `https://czuschmidt.github.io/`. In that case, set `baseurl: ""` in `_config.yml`.

## Previewing on your computer (optional)

Requires Ruby. From the repository folder:

```sh
bundle install
bundle exec jekyll serve
```

Then open http://localhost:4000/cz_portfolio/. Restart the server after editing `_config.yml`.

---

## Design notes

These are the rules the site follows. Keep them in mind when you extend it.

- **Colour:** white background and near-black text, with orange as the only accent. Orange is used for link underlines, focus rings and hover states.
- **Type:** Source Serif 4 for headings and Source Sans 3 for text and labels. Headings use weight 600 and body text 400.
- **Spacing:** an 8px scale (`--s0` … `--s6` in `main.css`). Use these variables instead of new pixel values.
- **Shape:** a single 4px radius everywhere, 1px borders, and no drop shadows.
- **Motion:** hover states only change colour, over 150ms. Nothing moves or scales, and transitions are disabled for visitors who prefer reduced motion.
