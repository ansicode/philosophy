# phi.github.io

A comprehensive web framework for exploring the **history of philosophy** across cultures, eras, and centuries.

## 🚀 Features

- **Responsive Design**: Mobile-friendly interface that works on all devices
- **Multiple Eras**: Ancient, Medieval, Modern, and Contemporary philosophy
- **Featured Philosophers**: Quick profiles of influential thinkers
- **Interactive Navigation**: Smooth scrolling and dynamic menu
- **Modern Stack**: Pure HTML5, CSS3, and vanilla JavaScript (no dependencies)

## 📁 Project Structure

```
phi.github.io/
├── index.html              # Main landing page
├── _config.yml             # Jekyll configuration for GitHub Pages
├── css/
│   └── style.css          # Responsive styling
├── js/
│   └── main.js            # Interactive features (menu, scroll effects)
├── eras/
│   ├── ancient.html       # Ancient philosophy (600 BCE - 500 CE)
│   ├── medieval.html      # Medieval philosophy (500 - 1400 CE)
│   ├── modern.html        # Modern philosophy (1600 - 1800 CE)
│   └── contemporary.html  # Contemporary philosophy (1900 - Present)
└── README.md              # This file
```

## 🎨 Design Features

- **Color Scheme**: Purple gradients with blue accents
- **Typography**: System fonts for fast loading
- **Animations**: Fade-in effects on scroll
- **Accessibility**: Semantic HTML, proper heading hierarchy
- **Mobile First**: Hamburger menu for mobile devices

## 🏃 Getting Started

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/ansicode/phi.github.io.git
cd phi.github.io
```

2. Start a local server (Python):
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000`

Or using Node.js:
```bash
npx http-server
```

### GitHub Pages

The site is automatically deployed to GitHub Pages. Simply push changes to the `main` branch:

```bash
git add .
git commit -m "Update content"
git push origin main
```

Your site will be live at `https://ansicode.github.io/phi.github.io`

## 📝 Content Management

### Adding a New Philosopher

1. Edit the philosopher in `index.html` under the "Featured Philosophers" section
2. Update the avatar letter and information
3. Link to a dedicated page if desired

### Adding a New Era

1. Create a new file in the `eras/` directory (e.g., `eras/eastern.html`)
2. Use `eras/ancient.html` as a template
3. Add a link in the main `index.html` era grid

### Customizing Content

All content is in plain HTML - simply edit the files directly:
- Update philosopher names and descriptions
- Modify era dates and information
- Add new sections by following the existing card patterns

## 🎯 Navigation

- **Home**: Hero section introducing the project
- **Eras**: Grid of major philosophical periods with links to detailed pages
- **Philosophers**: Featured thinkers from different eras
- **About**: Project overview and call-to-action

## 🔧 Customization

### Colors

Edit `css/style.css` to change the color scheme:
```css
/* Main gradient colors */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Primary button color */
--primary-color: #3498db;

/* Text colors */
--dark-text: #2c3e50;
--light-text: #666;
```

### Fonts

Modify the `font-family` in `css/style.css` to use custom Google Fonts or system fonts.

### Layout

The grid system uses CSS Grid and is fully responsive with breakpoints at 768px and 480px.

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

Contributions are welcome! Areas for expansion:
- Add more philosophers to each era
- Create detailed pages for major philosophical concepts
- Add visual timelines
- Expand era-specific content
- Add multilingual support

## 📄 License

This project is open source and available under the MIT License.

## 📧 Contact

For questions or suggestions, please open an issue on [GitHub](https://github.com/ansicode/phi.github.io/issues).

---

**Last Updated**: December 2025

Exploring ideas that shape the world.
