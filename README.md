# 📰 NewsVita — Campus Media & Event Intelligence Portal

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Responsive](https://img.shields.io/badge/Design-Responsive-brightgreen?style=for-the-badge)](#)

> **NewsVita** is a high-performance, responsive campus event and news showcase platform engineered to centralize university festivals, academic milestones, cultural nights, and student video recaps into a single, interactive media archive.

---

## 📌 Project Overview & Problem Statement

### 🔍 The Problem
In modern universities, event coverage, fest highlights, and student achievements are often fragmented across multiple unorganized social channels, ephemeral WhatsApp groups, and raw drive folders. There was no single, structured, responsive web application for students, faculty, and alumni to explore high-definition photo stories and 4K video highlights of campus life.

### 💡 The Solution: NewsVita
**NewsVita** solves this by providing:
1. **Interactive Categorized Media Showcase**: Fast client-side filtering for Cultural Festivals (Ganesh Chaturthi, Holi, Garba, Rangotsav), Academic Ceremonies (Annual Convocation), and Campus Fests (Advitya, Rajasthan Tour).
2. **Accessible Lightbox Viewer**: Keyboard-navigable image modal with full metadata, dates, and high-res view.
3. **Integrated Video Reel Player**: Responsive HTML5 video player with modern controls for fest highlight reels.
4. **Live Search Filtering**: Instant real-time search across event titles, categories, and descriptions.
5. **Clean Modular Architecture**: Clean separation between presentation (`index.html`), styling (`css/styles.css`), interactivity (`js/app.js`), and asset management (`assets/`).

---

## 🏛️ Project Architecture & Directory Structure

```text
newsvita/
│
├── assets/
│   ├── images/
│   │   ├── festivals/                 # Cultural celebration highlights
│   │   │   ├── ganesh-chaturthi-1.jpg
│   │   │   ├── ganesh-chaturthi-2.jpg
│   │   │   ├── ganesh-utsav.jpg
│   │   │   └── rangotsav.jpg
│   │   └── events/                    # Academic & inter-college events
│   │       ├── advitya-fest.jpg
│   │       ├── convocation-day.jpg
│   │       └── rajasthan-cultural-tour.jpg
│   ├── videos/                        # High-definition event reels
│   │   ├── convocation-ceremony.mp4
│   │   ├── garba-night.mp4
│   │   ├── holi-celebration.mp4
│   │   ├── music-concert.mp4
│   │   └── personality-development.mp4
│   └── icons/                         # Brand badges and SVGs
│
├── css/
│   └── styles.css                     # Glassmorphism, animations & modal styles
│
├── js/
│   └── app.js                         # Filtering engine, search & lightbox logic
│
├── .gitignore                         # Standard OS & editor ignore rules
├── index.html                         # Semantic HTML5 single-page application
└── README.md                          # Comprehensive project documentation
```

---

## ✨ Key Features & Technical Highlights

- ⚡ **Zero-Dependency Core**: Fast first contentful paint (FCP) and smooth 60fps animations without framework bloat.
- 🎨 **Glassmorphism Dark UI**: Designed with Tailwind CSS and custom backdrop filters for a sleek dark aesthetic.
- 📱 **Mobile-First Responsive Grid**: Auto-adjusting multi-column layouts across mobile phones, tablets, and wide desktop screens.
- 🔍 **Real-Time Client Search**: Sub-millisecond instantaneous keyword filtering across all media cards.
- 🖼️ **Interactive Lightbox Modal**: Keyboard-accessible (`Esc`, `←`, `→`) image modal with category badges and dates.
- 🎬 **Native Video Player Support**: Built-in responsive video playback containers for ceremony and fest reels.

---

## 🚀 Getting Started Locally

### 1. Clone the Repository
```bash
git clone https://github.com/code-with-apoorv/Newsvita.git
cd Newsvita
```

### 2. Launch the Application
You can open `index.html` directly in any modern browser:

**Using Python:**
```bash
python -m http.server 3000
```
Then visit `http://localhost:3000` in your browser.

**Using VS Code Live Server:**
Right-click `index.html` and select **"Open with Live Server"**.

---

## 🔮 Future Roadmap
- [ ] REST API backend integration for student leader article submissions.
- [ ] Cloudinary / AWS S3 image optimization pipeline with dynamic `srcset`.
- [ ] Like and bookmark functionality with localStorage persistence.
- [ ] Dark/Light mode toggle switch.

---

## 👨‍💻 Author
**Apoorv**  
- GitHub: [@code-with-apoorv](https://github.com/code-with-apoorv)  
- Project: [NewsVita on GitHub](https://github.com/code-with-apoorv/Newsvita)

