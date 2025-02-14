<div align="center">

# 🥾 Bill Splitter

<h3>Split bills effortlessly with friends and family</h3>

[Features](#features) • [Demo](#demo) • [Installation](#installation) • [Usage](#usage) • [Contributing](#contributing)

![Bill Splitter Demo](demo.gif)

</div>

---

## ✨ Features

### Core Functionality
- 📸 **Smart Receipt Scanning**
  - Upload images or use camera
  - Automatic text recognition (OCR)
  - Intelligent item and price detection

- 👥 **Multi-Person Support**
  - Add unlimited participants
  - Easy name management
  - Quick person removal

- 💰 **Advanced Calculations**
  - Automatic tax distribution
  - Flexible tip calculations
  - Per-item assignment

### User Experience
- 🎨 **Modern Interface**
  - Clean, intuitive design
  - Responsive layout
  - Dark/light mode support

- 📱 **Cross-Platform**
  - Works on mobile devices
  - Desktop optimized
  - Camera integration

- ⚡ **Real-Time Updates**
  - Instant calculations
  - Live preview
  - No page reloads

## 🎯 Demo

Try it out: [Bill Splitter Live Demo](https://your-demo-link.com)

<details>
<summary>📸 Screenshot Gallery</summary>

### Home Screen
![Home Screen](screenshots/home.png)

### Receipt Scanning
![Receipt Scanning](screenshots/scan.png)

### Item Assignment
![Item Assignment](screenshots/assign.png)

### Final Split
![Final Split](screenshots/split.png)

</details>

## 🚀 Installation

### Prerequisites
```bash
Node.js >= 14.0.0
npm >= 6.0.0
```

### Setup Steps

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/bill-splitter.git
cd bill-splitter
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Build for production**
```bash
npm run build
```

## 💡 Usage

### Quick Start Guide

1. **Add People**
   - Click "Add Person" button
   - Enter names of all participants
   - Remove anyone who's not splitting

2. **Scan Receipt**
   - Use camera or upload image
   - Verify scanned items
   - Adjust any misread values

3. **Assign Items**
   - Select who paid the bill
   - Drag items to assign
   - Set tax and tip preferences

4. **Review Split**
   - Check individual totals
   - Verify tax/tip distribution
   - Share results with group

## 🛠 Tech Stack

### Frontend
- **React** - UI framework
- **Chakra UI** - Component library
- **Emotion** - Styling solution

### Image Processing
- **Tesseract.js** - OCR engine
- **react-webcam** - Camera handling
- **react-dropzone** - File uploads

### Development
- **Vite** - Build tool
- **ESLint** - Code linting
- **TypeScript** - Type checking

## 📚 Documentation

<details>
<summary>Component Structure</summary>

### Key Components

```jsx
BillSplitter/
├── ReceiptScanner/
│   ├── Camera
│   └── ImageUpload
├── ItemSelector/
│   ├── ItemList
│   └── AssignmentControls
└── PeopleSplitter/
    ├── PersonList
    └── Calculations
```

</details>

<details>
<summary>API Reference</summary>

### Core Functions

```typescript
scanReceipt(image: File): Promise<ReceiptData>
calculateSplit(items: Item[], people: Person[]): Split[]
assignItem(itemId: string, personId: string): void
```

</details>

## 🤝 Contributing

We love your input! We want to make contributing as easy and transparent as possible.

### Development Process

1. Fork the repo
2. Create feature branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit changes
   ```bash
   git commit -m 'Add AmazingFeature'
   ```
4. Push to branch
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open Pull Request

### Code Style
- Follow existing patterns
- Add meaningful comments
- Write descriptive commit messages

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👏 Acknowledgments

- [Tesseract.js](https://tesseract.projectnaptha.com/)
- [Chakra UI](https://chakra-ui.com/)
- [React](https://reactjs.org/)
- All our amazing contributors

---

<div align="center">

Made with ❤️ by Kevin

[⬆ Back to Top](#bill-splitter)

</div>