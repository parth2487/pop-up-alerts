// Menggunakan IIFE (Immediately Invoked Function Expression)
// untuk menghindari konflik dengan variabel di situs web klien.

( () => {
  // 1. Temukan tag script ini sendiri untuk membaca atributnya

function loadFingerprintJS() {
  return new Promise((resolve, reject) => {
    if (window.FingerprintJS) return resolve(window.FingerprintJS);

    const fpScript = document.createElement('script');
    fpScript.src = "https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@3/dist/fp.min.js";
    fpScript.onload = () => resolve(window.FingerprintJS);
    fpScript.onerror = reject;
    document.head.appendChild(fpScript);
  });
  }




  const scriptElement = document.currentScript;
  if (!scriptElement) {
    console.error('PopupAlerts: Could not find the script element.');
    return;
  }
  const widgetId = scriptElement.getAttribute('data-widget-id');

  function getDeviceId() {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = crypto.randomUUID(); 
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
  }

  // 2️⃣ Get user's public IP
  async function getUserIP() {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      return data.ip || 'unknown';
    } catch (err) {
      console.warn('Could not get IP, using fallback:', err);
      return 'unknown';
    }
  }

  // 3️⃣ Get device/browser fingerprint
  async function getFingerprint() {
    // if (!window.FingerprintJS) return 'unknown';
    try {
      const FingerprintJS = await loadFingerprintJS();

      // console.log(await FingerprintJS.load())
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      // console.log("result is the :: ",result)
      return result.visitorId || 'unknown';
    } catch (err) {
      console.warn('Fingerprint failed:', err);
      return 'unknown';
    }
  }

  // 4️⃣ Call backend to increment open_count
  async function trackWidgetOpen(widgetId) {
    const deviceId = getDeviceId();
    const fingerprint = await getFingerprint();
    const ip = await getUserIP();
    // console.log("device id :: ",deviceId)
    // console.log("fingerprint :: ",fingerprint)
    // console.log("ip :: ",ip)
    try {
      await fetch(`https://mochafolk.com/api/${widgetId}/open`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, fingerprint, ip }),
      });
      console.log('Widget open tracked:', widgetId);
    } catch (err) {
      console.error('Failed to track widget open:', err);
    }
  }

  // Call tracking function when widget loads
  trackWidgetOpen(widgetId);


  if (!widgetId) {
    console.error('PopupAlerts: Widget ID is missing.');
    return;
  }

  // 2. Ambil data konfigurasi widget dari API publik kita
  fetch(`https://mochafolk.com/api/widgets/${widgetId}/public`)
    .then(response => {


      if (!response.ok) {
        throw new Error('Could not fetch widget data.');
      }

      return response.json();
    })
    .then(data => {
      // 3. Buat elemen widget berdasarkan data yang diterima

      switch (data.type) {
        case 'informational':
          if (data.settings.text) createInformationalWidget(data.settings);
          break;
        case 'coupon':
          if (data.settings.couponCode) createCouponWidget(data.settings);
          break;
        case 'live_counter':
          createLiveCounterWidget(widgetId, data.settings, data.view_count);
          break;
        case 'email_collector':
          createEmailCollectorWidget(widgetId, data.settings);
          break;
        case 'recent_conversions':
          createRecentConversionsWidget(widgetId, data.settings);
          break;
        case 'conversion_counter':
          createConversionCounterWidget(widgetId, data.settings);
          break;
        case 'countdown_timer':
          createCountdownTimerWidget(data.settings);
          break;
        case 'reviews':
          createReviewsWidget(widgetId, data.settings);
          break;
        case 'social_share':
          createSocialShareWidget(data.settings);
          break;
        case 'feedback':
          createFeedbackWidget(widgetId, data.settings);
          break;
        case 'video':
          createVideoWidget(data.settings);
          break;
        case 'cookie_notification':
          createCookieWidget(data.settings);
          break;
        default:
          console.error(`PopupAlerts: Unknown widget type "${data.type}"`);
      }
    })
    .catch(error => {
      console.error('PopupAlerts: Error loading widget.', error);
    });

  // --- Fungsi untuk setiap tipe widget ---

  // function createInformationalWidget(settings) {
  //   // loadGoogleFont(settings.fontFamily);
  //   console.log("inside the information widget bhai ok")
  //   const widget = document.createElement('div');
    
  //   // Styling dasar
  //   widget.style.position = 'fixed';
  //   widget.style.bottom = '20px';
  //   widget.style.left = '20px';
  //   widget.style.zIndex = '9999';
  //   widget.style.transition = 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out';
  //   widget.style.opacity = '0';
  //   widget.style.transform = 'translateY(20px)';

  //   // Terapkan kustomisasi
  //   widget.style.backgroundColor = settings.backgroundColor || '#2c3e50';
  //   widget.style.color = settings.textColor || '#ffffff';
  //   widget.style.fontFamily = settings.fontFamily || 'Inter, sans-serif';
  //   widget.style.padding = '20px';
  //   widget.style.borderRadius = '8px';
  //   widget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
  //   widget.style.maxWidth = '350px';
    
  //   // Tambahkan Logo jika ada
  //   if (settings.logoUrl) {
  //       const logo = document.createElement('img');
  //       logo.src = settings.logoUrl;
  //       logo.style.height = '24px';
  //       logo.style.width = 'auto';
  //       logo.style.marginBottom = '12px';
  //       widget.appendChild(logo);
  //   }
    
  //   // Tambahkan Teks Pesan
  //   const textElement = document.createElement('p');
  //   textElement.textContent = settings.text || 'hello';
  //   textElement.style.margin = '0';
  //   textElement.style.lineHeight = '1.5';
  //   widget.appendChild(textElement);
    
  //   // Tambahkan Tombol Close
  //   const closeButton = createCloseButton(widget, settings.textColor || '#ffffff');
  //   widget.appendChild(closeButton);

  //   // Logika Waktu (Timing)
  //   const delay = (settings.displayDelay || 0) * 1000;
  //   const duration = (settings.displayDuration || 0) * 1000;

  //   setTimeout(() => {
  //       document.body.appendChild(widget);
  //       // Memicu animasi muncul
  //       setTimeout(() => {
  //           widget.style.opacity = '1';
  //           widget.style.transform = 'translateY(0)';
  //       }, 50);

  //       if (duration > 0) {
  //           setTimeout(() => {
  //               widget.style.opacity = '0';
  //               widget.style.transform = 'translateY(20px)';
  //               setTimeout(() => widget.remove(), 500); // Hapus dari DOM setelah transisi selesai
  //           }, duration);
  //       }
  //   }, delay);
  // }

function createInformationalWidget(settings) {

  const widget = document.createElement("div");

  /* ---------------- BASE POSITIONING ---------------- */
  widget.style.position = "fixed";
  widget.style.bottom = "20px";
  widget.style.left = "20px";
  widget.style.zIndex = "9999";
  widget.style.transition = "opacity 0.4s ease, transform 0.4s ease";
  widget.style.opacity = "0";
  widget.style.transform = "translateY(20px)";

  /* ---------------- MODERN UI DESIGN ---------------- */
  widget.style.background =
    settings.backgroundColor ||
    "linear-gradient(135deg, rgba(40,40,60,0.95), rgba(20,20,35,0.95))";

  widget.style.backdropFilter = "blur(10px)";
  widget.style.border = "1px solid rgba(255,255,255,0.1)";
  widget.style.color = settings.textColor || "#f1f5f9";
  widget.style.fontFamily = settings.fontFamily || "Inter, sans-serif"; 
  widget.style.padding = "20px";
  widget.style.borderRadius = "16px";
  widget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.35)";
  widget.style.maxWidth = "360px";
  widget.style.position = "fixed";

  /* ---------------- CLOSE BUTTON ---------------- */
  const closeButton = document.createElement("button");
  closeButton.innerHTML = "&times;";
  closeButton.style.position = "absolute";
  closeButton.style.top = "10px";
  closeButton.style.right = "14px";
  closeButton.style.background = "transparent";
  closeButton.style.border = "none";
  closeButton.style.color = "#fff";
  closeButton.style.fontSize = "22px";
  closeButton.style.cursor = "pointer";
  closeButton.style.opacity = "0.75";
  closeButton.style.transition = "0.2s";

  closeButton.onmouseenter = () => (closeButton.style.opacity = "1");
  closeButton.onmouseleave = () => (closeButton.style.opacity = "0.75");

  closeButton.onclick = () => {
    widget.style.opacity = "0";
    widget.style.transform = "translateY(20px)";
    setTimeout(() => widget.remove(), 350);
  };

  widget.appendChild(closeButton);

  /* ---------------- HEADER (LOGO + TITLE) ---------------- */
  const headerRow = document.createElement("div");
  headerRow.style.display = "flex";
  headerRow.style.alignItems = "center";
  headerRow.style.gap = "10px";
  headerRow.style.marginBottom = "8px";

  if (settings.logoUrl) {
    const logo = document.createElement("img");
    logo.src = settings.logoUrl;
    logo.style.height = "24px";
    logo.style.width = "24px";
    logo.style.borderRadius = "4px";
    logo.style.objectFit = "contain";
    headerRow.appendChild(logo);
  }

  if (settings.title) {
    const title = document.createElement("div");
    title.textContent = settings.title;
    title.style.fontSize = "15px";
    title.style.fontWeight = "600";
    headerRow.appendChild(title);
  }

  if (settings.logoUrl || settings.title) widget.appendChild(headerRow);

  /* ---------------- MESSAGE TEXT ---------------- */
  const textElement = document.createElement("p");
  textElement.textContent = settings.text || "Hello!";
  textElement.style.margin = "0";
  textElement.style.fontSize = "14px";
  textElement.style.lineHeight = "1.5";
  textElement.style.color = "#e2e8f0";
  widget.appendChild(textElement);

  /* ---------------- TIMING LOGIC ---------------- */
  const delay = (settings.displayDelay || 0) * 1000;
  const duration = (settings.displayDuration || 0) * 1000;

  setTimeout(() => {
    document.body.appendChild(widget);

    // Fade-in animation
    setTimeout(() => {
      widget.style.opacity = "1";
      widget.style.transform = "translateY(0)";
    }, 40);

    // Auto remove
    if (duration > 0) {
      setTimeout(() => {
        widget.style.opacity = "0";
        widget.style.transform = "translateY(20px)";
        setTimeout(() => widget.remove(), 400);
      }, duration);
    }
  }, delay);
}

  function createLiveCounterWidget(widgetId, settings, initialCount) {
    const widget = document.createElement('div');
    widget.style.position = 'fixed';
    widget.style.top = '20px';
    widget.style.left = '20px';
    widget.style.backgroundColor = '#e74c3c';
    widget.style.color = 'white';
    widget.style.padding = '10px 20px';
    widget.style.borderRadius = '30px';
    widget.style.fontFamily = 'sans-serif';
    widget.style.fontSize = '14px';
    widget.style.zIndex = '9999';
    const countSpan = document.createElement('span');
    countSpan.textContent = initialCount;
    countSpan.style.fontWeight = 'bold';
    widget.append(settings.prefixText || '', ' ', countSpan, ' ', settings.suffixText || '');
    document.body.appendChild(widget);
    // fetch(`${API_BASE_URL}/api/widgets/${widgetId}/view`, { method: 'POST' });
  fetch(`https://mochafolk.com/api/widgets/${widgetId}/view`, { method: 'POST' });
  
  }

  function createEmailCollectorWidget(widgetId, settings) {
    const widget = createBasePopup('', 'bottom-left');
    widget.style.maxWidth = '350px';
    const form = document.createElement('form');
    const headline = document.createElement('h3');
    headline.textContent = settings.headline;
    headline.style.margin = '0 0 10px 0';
    headline.style.fontSize = '20px';
    const description = document.createElement('p');
    description.textContent = settings.description;
    description.style.margin = '0 0 15px 0';
    description.style.fontSize = '14px';
    description.style.color = '#666';
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.placeholder = 'Enter your email';
    emailInput.required = true;
    emailInput.style.width = '100%';
    emailInput.style.padding = '10px';
    emailInput.style.border = '1px solid #ccc';
    emailInput.style.borderRadius = '4px';
    emailInput.style.marginBottom = '10px';
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = settings.buttonText;
    submitButton.style.width = '100%';
    submitButton.style.padding = '10px';
    submitButton.style.border = 'none';
    submitButton.style.borderRadius = '4px';
    submitButton.style.backgroundColor = '#5e72e4';
    submitButton.style.color = 'white';
    submitButton.style.fontWeight = 'bold';
    submitButton.style.cursor = 'pointer';
    form.appendChild(headline);
    form.appendChild(description);
    form.appendChild(emailInput);
    form.appendChild(submitButton);
    widget.appendChild(form);
    const closeButton = createCloseButton(widget);
    widget.appendChild(closeButton);
    document.body.appendChild(widget);
    form.onsubmit = (e) => {
      e.preventDefault();
      submitButton.textContent = 'Submitting...';
      const payload = { data: { email: emailInput.value } };
      fetch(`https://mochafolk.com/api/widgets/${widgetId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }) .then(() => {
        widget.innerHTML = '';
        const successMessage = document.createElement('p');
        successMessage.textContent = settings.successMessage;
        successMessage.style.margin = '0';
        widget.appendChild(successMessage);
      });
    };
  }


function createCouponWidget(config) {
  const {
    title = "Special Discount",
    description = "Use coupon to get offer",
    couponCode = "SAVE20",
    image = "",
    buttonText = "Claim",
    position = "bottom-right",
    backgroundColor = "#ffffff",
    textColor = "#111111",
    buttonColor = "#2563eb",

  } = config;

  /* ---------------- Styles ---------------- */
  const style = document.createElement("style");
  style.innerHTML = `
    .coupon-card {
      width: 500px;
      background:  ${backgroundColor};
      border-radius: 20px;
      padding: 20px;
      display: flex;
      gap: 18px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
      position: fixed;
      opacity: 0;
      color: ${textColor};
      transform: translateY(30px);
      transition: 0.4s ease;
      z-index: 999999;
    }

 
    .coupon-card.show {
      opacity: 1;
      transform: translateY(0);
    }

    .coupon-card.top-left {
      top: 20px;
      left: 20px;
    }

    .coupon-card.top-right {
      top: 20px;
      right: 20px;
    }

    .coupon-card.bottom-left {
    bottom: 20px;
    left: 20px;
    }

    .coupon-card.bottom-right {
      bottom: 20px;
    right: 20px;
    }
    .coupon-img {
      width: 160px;
      height: 200px;
      border-radius: 16px;
      object-fit: cover;
    }

    .coupon-title {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 6px;
            color: ${textColor};

    }

    .coupon-desc {
      font-size: 14px;
      color: ${textColor};
      margin-bottom: 18px;
    }

    .coupon-box {
      border: 2px dashed #111;
      border-radius: 12px;
      padding: 12px;
      font-size: 20px;
      font-weight: 600;
      text-align: center;
      margin-bottom: 16px;
      letter-spacing: 1px;
            color: ${textColor};

    }

    .coupon-btn {
      width: 100%;
      background: #2563eb;
      padding: 12px;
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: 0.3s;
      color: ${buttonColor};

    }

    .coupon-btn:hover {
      background: #1e4fd3;
    }

    .coupon-close {
      position: absolute;
      top: 10px;
      right: 14px;
      font-size: 22px;
      cursor: pointer;
      color: ${textColor};
    }

    .coupon-close:hover {
      color: #111;
    }
  `;
  document.head.appendChild(style);

  /* ---------------- Card Wrapper ---------------- */
  const card = document.createElement("div");
  card.className = `coupon-card ${position}`;

  /* ---------------- Close Button ---------------- */
  const close = document.createElement("div");
  close.className = "coupon-close";
  close.innerHTML = "×";
  close.onclick = () => card.remove();
  card.appendChild(close);

  /* ---------------- Left Image ---------------- */
  const img = document.createElement("img");
  img.className = "coupon-img";
  img.src = image || "https://via.placeholder.com/160x200";
  card.appendChild(img);

  /* ---------------- Right Content ---------------- */
  const right = document.createElement("div");
  right.style.flex = "1";

  const titleEl = document.createElement("div");
  titleEl.className = "coupon-title";
  titleEl.innerHTML = title;

  const descEl = document.createElement("div");
  descEl.className = "coupon-desc";
  descEl.innerHTML = description;

  const coupon = document.createElement("div");
  coupon.className = "coupon-box";
  coupon.innerHTML = couponCode;

  const btn = document.createElement("button");
  btn.className = "coupon-btn";
  btn.innerHTML = buttonText;

  btn.onclick = () => {
    navigator.clipboard.writeText(couponCode);
    alert("Coupon copied: " + couponCode);
  };

  right.appendChild(titleEl);
  right.appendChild(descEl);
  right.appendChild(coupon);
  right.appendChild(btn);
  card.appendChild(right);

  document.body.appendChild(card);

  /* ---------------- Animation ---------------- */
  setTimeout(() => card.classList.add("show"), 300);
}



  function createRecentConversionsWidget(widgetId, settings) {
    fetch(`https://mochafolk.com/api/widgets/${widgetId}/recent-leads`)
      .then(res => res.json())
      .then(leads => {
        if (leads && leads.length > 0) {
          let currentIndex = 0;
          const showNextLead = () => {
            const rawLead = leads[currentIndex];
            let leadData = typeof rawLead.data === 'string' ? JSON.parse(rawLead.data) : rawLead.data;
            if (leadData && leadData.email && settings.messageTemplate) {
              const message = settings.messageTemplate.replace('[email]', leadData.email);
              const widget = createBasePopup(message, 'bottom-right');
              setTimeout(() => {
                widget.style.opacity = '0';
                setTimeout(() => widget.remove(), 500);
              }, 4000);
            }
            currentIndex = (currentIndex + 1) % leads.length;
          };
          showNextLead();
          setInterval(showNextLead, 7000);
        }
      });
  }

  function createConversionCounterWidget(widgetId, settings) {
    fetch(`https://mochafolk.com/api/widgets/${widgetId}/lead-count`)
      .then(res => res.json())
      .then(data => {
        const count = data.count;
        if (settings.messageTemplate) {
          const message = settings.messageTemplate.replace('[count]', count);
          createBasePopup(message, 'bottom-center');
        }
      });
  }

  function createCountdownTimerWidget(settings) {
    const targetDate = new Date(settings.endDate).getTime();
    if (isNaN(targetDate)) return;
    const widget = document.createElement('div');
    widget.style.position = 'fixed';
    widget.style.top = '0';
    widget.style.left = '0';
    widget.style.width = '100%';
    widget.style.backgroundColor = '#1f2937';
    widget.style.color = 'white';
    widget.style.padding = '12px 0';
    widget.style.textAlign = 'center';
    widget.style.fontFamily = 'sans-serif';
    widget.style.zIndex = '10000';
    widget.style.fontSize = '16px';
    const timerSpan = document.createElement('span');
    timerSpan.style.fontWeight = 'bold';
    timerSpan.style.minWidth = '120px';
    timerSpan.style.display = 'inline-block';
    const updateTimer = () => {
      const distance = targetDate - new Date().getTime();
      if (distance < 0) {
        clearInterval(interval);
        widget.textContent = settings.expiredMessage;
        return;
      }
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      const format = (num) => num.toString().padStart(2, '0');
      timerSpan.textContent = `${format(days)}:${format(hours)}:${format(minutes)}:${format(seconds)}`;
      const message = settings.messageTemplate || 'Ends in [timer]';
      const parts = message.split('[timer]');
      widget.innerHTML = '';
      widget.append(parts[0] || '', timerSpan, parts[1] || '');
    };
    const interval = setInterval(updateTimer, 1000);
    updateTimer();
    document.body.appendChild(widget);
  }

function createReviewsWidget(widgetId, settings) {
  fetch(`https://mochafolk.com/api/reviews/widget/${widgetId}`)
    .then(res => res.json())
    .then(reviews => {
      if (reviews && reviews.length > 0) {

        let currentIndex = 0;

        const showNextReview = () => {
          const review = reviews[currentIndex];

          // Base popup
          const widget = createBasePopup('', 'bottom-left');
          widget.style.maxWidth = '320px';
          widget.style.width = '92%';
          widget.style.padding = '16px';
          widget.style.borderRadius = '14px';
          widget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          widget.style.background = '#ffffff';
          widget.style.color = '#333';
          widget.style.fontFamily = 'Arial, sans-serif';
          widget.style.transition = 'opacity 0.4s ease';
          widget.style.opacity = '0';

          setTimeout(() => widget.style.opacity = '1', 50);

          /* -------- ⭐ Stars Section -------- */
          const starsContainer = document.createElement('div');
          starsContainer.style.marginBottom = '10px';
          starsContainer.style.textAlign = 'left';

          for (let i = 0; i < 5; i++) {
            const star = document.createElement('span');
            star.innerHTML = '★';
            star.style.color = i < review.rating ? '#f7c325' : '#dcdcdc';
            star.style.fontSize = '22px';
            star.style.marginRight = '2px';
            starsContainer.appendChild(star);
          }

          /* -------- 💬 Review Text -------- */
          const text = document.createElement('p');
          text.textContent = `"${review.text}"`;
          text.style.margin = '0 0 12px';
          text.style.lineHeight = '1.4';
          text.style.fontSize = '15px';
          text.style.fontWeight = '500';
          text.style.color = '#444';

          /* -------- 👤 Author Section -------- */
          const author = document.createElement('p');
          author.textContent = `– ${review.author}`;
          author.style.margin = '0';
          author.style.textAlign = 'right';
          author.style.fontWeight = '600';
          author.style.color = '#222';
          author.style.fontSize = '14px';

          /* -------- ❌ Close Button -------- */
          const closeButton = createCloseButton(widget);
          closeButton.style.top = '6px';
          closeButton.style.right = '8px';
          closeButton.style.fontSize = '16px';
          closeButton.style.background = '#eee';
          closeButton.style.borderRadius = '50%';
          closeButton.style.padding = '2px 6px';

          /* -------- Add Elements -------- */
          widget.appendChild(starsContainer);
          widget.appendChild(text);
          widget.appendChild(author);
          widget.appendChild(closeButton);

          /* -------- Auto Hide -------- */
          setTimeout(() => {
            widget.style.opacity = '0';
            setTimeout(() => widget.remove(), 400);
          }, 6000); // stays visible for 6 seconds

          // Move to next review
          currentIndex = (currentIndex + 1) % reviews.length;
        };

        // First review
        showNextReview();

        // Next reviews every 8 seconds
        setInterval(showNextReview, 8000);
      }
    });
}


function createFeedbackWidget(widgetId, settings) {
    const widget = createBasePopup('', 'bottom-right');
    widget.style.textAlign = 'center';

    const questionText = document.createElement('p');
    questionText.textContent = settings.questionText;
    questionText.style.margin = '0 0 15px 0';
    questionText.style.fontSize = '16px';
    
    const emojiContainer = document.createElement('div');
    emojiContainer.style.display = 'flex';
    emojiContainer.style.gap = '15px';
    emojiContainer.style.justifyContent = 'center';

    const emojis = {
    fire: '🔥',      // Emoji api yang menarik, melambangkan sesuatu yang "panas" atau energik
    shit: '💩',      // Emoji kotoran seperti yang Anda sebutkan, untuk elemen humoris atau unik
    star: '🌟',      // Emoji bintang, menambahkan sentuhan ajaib dan menarik
    rocket: '🚀',    // Emoji roket, untuk nuansa petualangan atau kecepatan
    cool: '😎'       // Emoji cool, menambahkan elemen keren dan santai
};

    Object.entries(emojis).forEach(([response, emoji]) => {
        const button = document.createElement('button');
        button.textContent = emoji;
        button.style.border = 'none';
        button.style.backgroundColor = 'transparent';
        button.style.fontSize = '36px';
        button.style.cursor = 'pointer';
        button.style.transition = 'transform 0.2s';
        button.onmouseover = () => button.style.transform = 'scale(1.2)';
        button.onmouseout = () => button.style.transform = 'scale(1)';

        button.onclick = () => {
            fetch(`https://mochafolk.com/api/widgets/${widgetId}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ response }),
            }).then(() => {
                widget.innerHTML = '';
                const thankYouMessage = document.createElement('p');
                thankYouMessage.textContent = settings.thankYouMessage;
                thankYouMessage.style.margin = '0';
                widget.appendChild(thankYouMessage);
            });
        };
        emojiContainer.appendChild(button);
    });
    
    widget.appendChild(questionText);
    widget.appendChild(emojiContainer);
    document.body.appendChild(widget);
  }
  function createVideoWidget(settings) {
    const embedUrl = getYouTubeEmbedUrl(settings.videoUrl);
    if (!embedUrl) {
      console.error('PopupAlerts: Invalid YouTube URL for video widget.');
      return;
    }

    // Buat overlay (latar belakang gelap)
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    overlay.style.zIndex = '9998';
    
    // Buat container modal
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.zIndex = '9999';
    modal.style.backgroundColor = 'black';
    modal.style.padding = '10px';
    modal.style.borderRadius = '8px';
    modal.style.boxShadow = '0 5px 20px rgba(0,0,0,0.5)';
    modal.style.width = '90%';
    modal.style.maxWidth = '800px';

    // Container rasio untuk video
    const videoContainer = document.createElement('div');
    videoContainer.style.position = 'relative';
    videoContainer.style.paddingBottom = '56.25%'; // 16:9 aspect ratio
    videoContainer.style.height = '0';
    
    // Buat iframe
    const iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.style.position = 'absolute';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    
    // Buat tombol close
    const closeButton = createCloseButton(modal, '#fff');
    closeButton.style.top = '-30px';
    closeButton.style.right = '0px';
    closeButton.style.fontSize = '30px';

    // Fungsi untuk menutup modal
    const closeModal = () => {
      modal.remove();
      overlay.remove();
    };
    closeButton.onclick = closeModal;
    overlay.onclick = closeModal;

    // Gabungkan semuanya
    videoContainer.appendChild(iframe);
    modal.appendChild(videoContainer);
    modal.appendChild(closeButton);
    
    document.body.appendChild(overlay);
    document.body.appendChild(modal);
  }
function createCookieWidget(settings) {
    // Langkah 1: Periksa localStorage. Jika sudah setuju, jangan tampilkan apa-apa.
    if (localStorage.getItem('cookie_consent') === 'true') {
      return;
    }

    // Buat banner utama
    const banner = document.createElement('div');
    banner.style.position = 'fixed';
    banner.style.bottom = '0';
    banner.style.left = '0';
    banner.style.width = '100%';
    banner.style.backgroundColor = '#343a40';
    banner.style.color = 'white';
    banner.style.padding = '15px';
    banner.style.zIndex = '10000';
    banner.style.display = 'flex';
    banner.style.justifyContent = 'space-between';
    banner.style.alignItems = 'center';
    banner.style.fontFamily = 'sans-serif';

    // Teks pesan
    const message = document.createElement('p');
    message.textContent = settings.cookieMessage;
    message.style.margin = '0';
    message.style.fontSize = '14px';

    // Tombol persetujuan
    const button = document.createElement('button');
    button.textContent = settings.cookieButtonText;
    button.style.marginLeft = '20px';
    button.style.padding = '8px 16px';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.backgroundColor = '#007bff';
    button.style.color = 'white';
    button.style.cursor = 'pointer';

    // Langkah 5: Tambahkan event listener ke tombol
    button.onclick = () => {
      // Simpan persetujuan ke localStorage
      localStorage.setItem('cookie_consent', 'true');
      // Hilangkan banner
      banner.remove();
    };

    banner.appendChild(message);
    banner.appendChild(button);

    document.body.appendChild(banner);
  }
  // --- Fungsi Helper ---

  function createCloseButton(widgetElement) {
    const closeButton = document.createElement('span');
    closeButton.innerHTML = '&times;';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '8px';
    closeButton.style.right = '12px';
    closeButton.style.fontSize = '24px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.lineHeight = '1';
    closeButton.style.color = '#aaa';
    closeButton.onmouseover = () => { closeButton.style.color = '#333'; };
    closeButton.onmouseout = () => { closeButton.style.color = '#aaa'; };
    closeButton.onclick = () => widgetElement.remove();
    return closeButton;
  }

  function createBasePopup(text, position = 'bottom-left') {
    const widget = document.createElement('div');
    if (text) widget.textContent = text;
    widget.style.position = 'fixed';
    widget.style.backgroundColor = 'white';
    widget.style.color = '#333';
    widget.style.padding = '20px';
    widget.style.borderRadius = '8px';
    widget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    widget.style.fontFamily = 'sans-serif';
    widget.style.fontSize = '16px';
    widget.style.zIndex = '9999';
    widget.style.transition = 'opacity 0.5s ease-in-out';
    widget.style.opacity = '1';
    if (position === 'bottom-left') {
      widget.style.bottom = '20px';
      widget.style.left = '20px';
    } else if (position === 'bottom-right') {
      widget.style.bottom = '20px';
      widget.style.right = '20px';
    } else if (position === 'bottom-center') {
      widget.style.bottom = '20px';
      widget.style.left = '50%';
      widget.style.transform = 'translateX(-50%)';
    }
    document.body.appendChild(widget);
    return widget;
  }
  function createSocialShareWidget(settings) {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '20px';
    container.style.top = '50%';
    container.style.transform = 'translateY(-50%)';
    container.style.zIndex = '9998';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';

    const pageUrl = encodeURIComponent(window.location.href);

    const socialPlatforms = {
      facebook: {
        url: `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`,
        icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3l-.5 3h-2.5v6.95C18.05 21.45 22 17.19 22 12z"></path></svg>`,
        color: '#1877F2'
      },
      twitter: {
        url: `https://twitter.com/intent/tweet?url=${pageUrl}`,
        icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.46 6c-.77.35-1.6.58-2.46.67.88-.53 1.56-1.37 1.88-2.38-.83.49-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98-3.56-.18-6.73-1.89-8.84-4.48-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.22-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21-.36.1-.74.15-1.14.15-.28 0-.55-.03-.81-.08.55 1.7 2.14 2.94 4.03 2.97-1.47 1.15-3.32 1.83-5.33 1.83-.35 0-.69-.02-1.03-.06 1.9 1.21 4.15 1.92 6.56 1.92 7.88 0 12.2-6.54 12.2-12.2 0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"></path></svg>`,
        color: '#1DA1F2'
      },
      linkedin: {
        url: `https://www.linkedin.com/shareArticle?mini=true&url=${pageUrl}`,
        icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 3H3C2.45 3 2 3.45 2 4v16c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM8 18H5V8h3v10zm-1.5-11.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM19 18h-3v-5.09c0-1.29-.49-2.18-1.76-2.18-.96 0-1.53.65-1.78 1.28-.09.22-.12.53-.12.84V18h-3V8h3v1.34c.42-.79 1.44-1.61 3.03-1.61 2.21 0 3.88 1.45 3.88 4.54V18z"></path></svg>`,
        color: '#0A66C2'
      },
      whatsapp: {
        url: `https://api.whatsapp.com/send?text=${pageUrl}`,
        icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.38 1.25 4.82l-1.34 4.93 5.05-1.32c1.39.71 2.96 1.14 4.59 1.14 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zM12.04 20.12c-1.48 0-2.91-.4-4.14-1.12l-.3-.18-3.07.8.82-3.02-.2-.31c-.8-1.27-1.29-2.76-1.29-4.38 0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.23.86 5.82 2.45s2.45 3.62 2.45 5.82c0 4.54-3.7 8.24-8.24 8.24zm4.52-6.13c-.25-.12-1.47-.72-1.7-.85-.23-.12-.39-.18-.56.12-.17.31-.64.85-.78 1.02-.14.17-.29.18-.53.06-.25-.12-1.04-.38-1.98-1.22-.73-.66-1.22-1.47-1.36-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.42-.14 0-.31-.02-.48-.02s-.42.06-.64.31c-.22.25-.85.83-.85 2.02s.87 2.34 1 2.5c.12.17 1.72 2.62 4.16 3.63.59.25 1.05.4 1.41.51.59.18 1.14.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.05-.12-.2-.18-.44-.31z"></path></svg>`,
        color: '#25D366'
      },
      telegram: {
        url: `https://t.me/share/url?url=${pageUrl}`,
        icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2s10 4.48 10 10zm-3.37-4.21c-.42-1.2-1.7-1.8-2.65-1.13l-10.1 6.8c-1.3.88-.4 2.37 1.13 2.37l4.3-.12 2.58 2.47c.56.55 1.5.1 1.5- L18.06 7.8c.2-.95-.6-1.8-1.43-2.01z"></path></svg>`,
        color: '#0088cc'
      },
    };

    for (const [platform, enabled] of Object.entries(settings.socials)) {
      if (enabled) {
        const platformData = socialPlatforms[platform];
        const link = document.createElement('a');
        link.href = platformData.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.innerHTML = platformData.icon;

        // Styling
        link.style.display = 'block';
        link.style.width = '48px';
        link.style.height = '48px';
        link.style.borderRadius = '50%';
        link.style.backgroundColor = platformData.color;
        link.style.color = 'white';
        link.style.display = 'flex';
        link.style.alignItems = 'center';
        link.style.justifyContent = 'center';
        link.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
        link.style.transition = 'transform 0.2s';
        
        const svg = link.querySelector('svg');
        if(svg){
          svg.style.width = '24px';
          svg.style.height = '24px';
        }

        link.onmouseover = () => { link.style.transform = 'scale(1.1)'; };
        link.onmouseout = () => { link.style.transform = 'scale(1)'; };

        container.appendChild(link);
      }
    }
    document.body.appendChild(container);
  }
function getYouTubeEmbedUrl(url) {
    if (!url) return null;
    let videoId = null;
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
        videoId = urlObj.searchParams.get('v');
      } else if (urlObj.hostname === 'youtu.be') {
        videoId = urlObj.pathname.slice(1);
      }
    } catch (e) {
      console.error('Invalid URL format');
      return null;
    }
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
    }
    return null;
  }

  function createCloseButton(widgetElement, color = '#aaa') {
    const closeButton = document.createElement('span');
    closeButton.innerHTML = '&times;'; // Karakter 'x'
    closeButton.style.position = 'absolute';
    closeButton.style.top = '8px';
    closeButton.style.right = '12px';
    closeButton.style.fontSize = '24px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.lineHeight = '1';
    closeButton.style.color = color;
    closeButton.onmouseover = () => { closeButton.style.color = color === '#fff' ? '#ccc' : '#333'; };
    closeButton.onmouseout = () => { closeButton.style.color = color; };
    closeButton.onclick = () => widgetElement.remove();
    return closeButton;
  }

  function loadGoogleFont(fontFamily) {
    if (!fontFamily || fontFamily === 'Inter') return; // Asumsi Inter adalah default
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(' ', '+')}:wght@400;700&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }

  function createBasePopup(text, position = 'bottom-left') {
    const widget = document.createElement('div');
    if (text) widget.textContent = text;
    widget.style.position = 'fixed';
    widget.style.backgroundColor = 'white';
    widget.style.color = '#333';
    widget.style.padding = '20px';
    widget.style.borderRadius = '8px';
    widget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    widget.style.fontFamily = 'sans-serif';
    widget.style.fontSize = '16px';
    widget.style.zIndex = '9999';
    widget.style.transition = 'opacity 0.5s ease-in-out';
    widget.style.opacity = '1';

    if (position === 'bottom-left') {
        widget.style.bottom = '20px';
        widget.style.left = '20px';
    } else if (position === 'bottom-right') {
        widget.style.bottom = '20px';
        widget.style.right = '20px';
    } else if (position === 'bottom-center') {
        widget.style.bottom = '20px';
        widget.style.left = '50%';
        widget.style.transform = 'translateX(-50%)';
    }
    document.body.appendChild(widget);
    return widget;
  }
})();

