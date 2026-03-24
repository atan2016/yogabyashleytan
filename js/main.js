(function () {
  var year = document.getElementById("year");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  function formatChatTime(d) {
    return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }

  var nav = document.getElementById("site-nav");
  var toggle = document.querySelector(".nav-toggle");

  function setNavOpen(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    var bars = toggle.querySelectorAll(".nav-toggle-bar");
    if (bars.length >= 2) {
      if (open) {
        bars[0].style.transform = "translateY(4px) rotate(45deg)";
        bars[1].style.transform = "translateY(-4px) rotate(-45deg)";
      } else {
        bars[0].style.transform = "";
        bars[1].style.transform = "";
      }
    }
  }

  if (nav && toggle) {
    toggle.addEventListener("click", function () {
      setNavOpen(!nav.classList.contains("is-open"));
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 768px)").matches) {
          setNavOpen(false);
        }
      });
    });
  }

  var dialog = document.getElementById("contact-dialog");
  var chatBody = document.getElementById("contact-chat-body");
  var chatDynamic = document.getElementById("contact-chat-dynamic");
  var chatForm = document.getElementById("contact-chat-form");
  var quickBtn = document.getElementById("contact-chat-quick");
  var timeInEl = document.getElementById("contact-chat-time-in");

  function trackContactMeClick(ctaLocation) {
    if (typeof window.gtag !== "function") return;
    window.gtag("event", "contact_me_click", {
      cta_location: ctaLocation,
    });
  }

  function contactCtaLocationFromElement(el) {
    if (!el) return "unknown";
    if (el.closest("#site-nav")) return "header_nav";
    if (el.closest(".hero")) return "hero";
    if (el.closest("#events")) return "events";
    if (el.closest("#what-we-offer")) return "what_we_offer";
    return "other";
  }

  if (timeInEl) {
    timeInEl.textContent = formatChatTime(new Date());
  }

  function scrollChatToBottom() {
    if (!chatBody) return;
    requestAnimationFrame(function () {
      chatBody.scrollTop = chatBody.scrollHeight;
    });
  }

  function closeContactModal() {
    if (dialog && dialog.open) dialog.close();
  }

  function openContactModal() {
    if (!dialog) return;
    if (typeof dialog.showModal !== "function") {
      var section = document.getElementById("contact");
      if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (chatDynamic) chatDynamic.innerHTML = "";
    if (quickBtn) quickBtn.classList.remove("is-hidden");
    var f = document.getElementById("contact-chat-form");
    if (f) f.reset();
    if (timeInEl) timeInEl.textContent = formatChatTime(new Date());
    dialog.showModal();
    document.body.classList.add("contact-modal-open");
    requestAnimationFrame(function () {
      var q = document.getElementById("contact-chat-quick");
      var ta = document.getElementById("contact-message");
      if (q && !q.classList.contains("is-hidden")) q.focus();
      else if (ta) ta.focus();
      scrollChatToBottom();
    });
  }

  if (dialog) {
    document.querySelectorAll("[data-close-contact]").forEach(function (btn) {
      btn.addEventListener("click", closeContactModal);
    });

    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) closeContactModal();
    });

    dialog.addEventListener("close", function () {
      document.body.classList.remove("contact-modal-open");
    });
  }

  function appendUserBubble() {
    if (!chatDynamic) return;
    var now = formatChatTime(new Date());
    var row = document.createElement("div");
    row.className = "contact-chat-row contact-chat-row--out";
    row.innerHTML =
      '<div class="contact-chat-bubble contact-chat-bubble--out"><p>I have a question</p></div>' +
      '<p class="contact-chat-foot contact-chat-foot--out">' +
      now +
      " · Sent</p>";
    chatDynamic.appendChild(row);
    scrollChatToBottom();
  }

  function appendThanksBubble() {
    if (!chatDynamic) return;
    var row = document.createElement("div");
    row.className = "contact-chat-row contact-chat-row--in";
    row.innerHTML =
      '<div class="contact-chat-avatar" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">' +
      '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>' +
      "</svg></div>" +
      '<div class="contact-chat-thread">' +
      '<div class="contact-chat-bubble contact-chat-bubble--in">' +
      "<p>Thanks! Your message has been submitted. We'll get back to you here or via email. We'll respond as soon as we can.</p>" +
      "</div></div>";
    chatDynamic.appendChild(row);
    scrollChatToBottom();
  }

  if (quickBtn) {
    quickBtn.addEventListener("click", function () {
      if (quickBtn.classList.contains("is-hidden")) return;
      quickBtn.classList.add("is-hidden");
      appendUserBubble();
      var ta = document.getElementById("contact-message");
      if (ta) {
        ta.value = "I have a question";
        ta.focus();
      }
    });
  }

  var formSubmitting = false;

  var pageForm = document.getElementById("page-contact-form");
  var pageStatus = document.getElementById("page-contact-status");

  function showPageFormStatus(message, isError) {
    if (!pageStatus) return;
    pageStatus.hidden = false;
    pageStatus.textContent = message;
    pageStatus.classList.toggle("is-error", !!isError);
  }

  var pageSubmitting = false;
  if (pageForm) {
    pageForm.addEventListener("submit", function (e) {
      var action = pageForm.getAttribute("action") || "";
      if (action.indexOf("YOUR_FORM_ID") !== -1) {
        e.preventDefault();
        window.alert(
          "Connect your form: replace YOUR_FORM_ID in index.html with your Formspree form ID (see form comment)."
        );
        return;
      }
      e.preventDefault();
      if (pageSubmitting) return;
      pageSubmitting = true;
      var pageBtn = pageForm.querySelector(".contact-page-submit");
      if (pageBtn) pageBtn.disabled = true;
      fetch(action, {
        method: "POST",
        body: new FormData(pageForm),
        headers: { Accept: "application/json" },
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Network error");
          showPageFormStatus("Thanks! Your message was sent. We’ll get back to you soon.", false);
          pageForm.reset();
        })
        .catch(function () {
          showPageFormStatus(
            "Something went wrong. Check your Formspree form ID and try again.",
            true
          );
        })
        .finally(function () {
          pageSubmitting = false;
          if (pageBtn) pageBtn.disabled = false;
        });
    });
  }

  if (chatForm) {
    chatForm.addEventListener("submit", function (e) {
      var action = chatForm.getAttribute("action") || "";
      if (action.indexOf("YOUR_FORM_ID") !== -1) {
        e.preventDefault();
        window.alert(
          "Connect your form: replace YOUR_FORM_ID in index.html with your Formspree form ID (see form comment)."
        );
        return;
      }

      e.preventDefault();
      if (formSubmitting) return;

      var msg = document.getElementById("contact-message");
      if (msg && !String(msg.value || "").trim()) {
        msg.focus();
        return;
      }

      formSubmitting = true;
      var sendBtn = chatForm.querySelector(".contact-chat-send");
      if (sendBtn) sendBtn.disabled = true;

      fetch(action, {
        method: "POST",
        body: new FormData(chatForm),
        headers: { Accept: "application/json" },
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Network error");
          appendThanksBubble();
          chatForm.reset();
          if (timeInEl) timeInEl.textContent = formatChatTime(new Date());
        })
        .catch(function () {
          window.alert(
            "Something went wrong sending your message. Check your Formspree form ID and try again."
          );
        })
        .finally(function () {
          formSubmitting = false;
          if (sendBtn) sendBtn.disabled = false;
        });
    });
  }

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest("[data-open-contact]");
    if (!trigger) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    trackContactMeClick("floating_chat");
    if (nav && nav.classList.contains("is-open")) setNavOpen(false);
    openContactModal();
  });

  document.addEventListener("click", function (e) {
    var link = e.target.closest('a[href="#contact"]');
    if (!link) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    trackContactMeClick(contactCtaLocationFromElement(link));
  });

  if (location.hash === "#contact") {
    var contactSection = document.getElementById("contact");
    if (contactSection) {
      requestAnimationFrame(function () {
        contactSection.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  /* Hero thumbnails: focal zoom follows cursor on hover */
  document.querySelectorAll("[data-hero-zoom]").forEach(function (btn) {
    var img = btn.querySelector("img");
    if (!img) return;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function setZoomOrigin(e) {
      if (reduceMotion) return;
      var rect = btn.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      var x = Math.max(2, Math.min(98, ((e.clientX - rect.left) / rect.width) * 100));
      var y = Math.max(2, Math.min(98, ((e.clientY - rect.top) / rect.height) * 100));
      img.style.transformOrigin = x + "% " + y + "%";
    }

    btn.addEventListener("mouseenter", setZoomOrigin);
    btn.addEventListener("mousemove", setZoomOrigin);
    btn.addEventListener("mouseleave", function () {
      img.style.transformOrigin = "";
    });
  });

  /* Hero photo zoom lightbox */
  var heroLb = document.getElementById("hero-lightbox");
  var heroLbImg = document.getElementById("hero-lightbox-img");
  var heroLbViewport = document.getElementById("hero-lightbox-viewport");
  var heroLbZoomPct = document.getElementById("hero-lightbox-zoom-pct");

  if (heroLb && heroLbImg && heroLbViewport) {
    var lbZoom = 1;
    var lbNaturalW = 0;
    var lbNaturalH = 0;
    var lbPanning = false;
    var lbPanX = 0;
    var lbPanY = 0;
    var lbPanSl = 0;
    var lbPanSt = 0;

    function lbApplyZoom() {
      if (!lbNaturalW || !lbNaturalH) return;
      var maxW = heroLbViewport.clientWidth;
      var maxH = Math.max(120, heroLbViewport.clientHeight);
      /* Cover viewport (like object-fit: cover) — no letterboxing at 100% */
      var cover = Math.max(maxW / lbNaturalW, maxH / lbNaturalH);
      var baseW = lbNaturalW * cover;
      heroLbImg.style.width = Math.round(Math.max(1, baseW * lbZoom)) + "px";
      heroLbImg.style.height = "auto";
      if (heroLbZoomPct) heroLbZoomPct.textContent = Math.round(lbZoom * 100) + "%";
    }

    function lbCenterScroll() {
      var el = heroLbViewport;
      el.scrollLeft = Math.max(0, (el.scrollWidth - el.clientWidth) / 2);
      el.scrollTop = Math.max(0, (el.scrollHeight - el.clientHeight) / 2);
    }

    function lbOnImgLoaded() {
      lbNaturalW = heroLbImg.naturalWidth;
      lbNaturalH = heroLbImg.naturalHeight;
      lbApplyZoom();
      requestAnimationFrame(function () {
        lbCenterScroll();
      });
    }

    function lbOpen(src, alt) {
      lbZoom = 1;
      heroLbImg.alt = alt || "";
      heroLbImg.onload = function () {
        lbOnImgLoaded();
      };
      heroLbImg.src = src;
      if (heroLbImg.complete && heroLbImg.naturalWidth) {
        lbOnImgLoaded();
      }
      heroLb.showModal();
      document.body.classList.add("hero-lightbox-open");
    }

    function lbClose() {
      heroLb.close();
    }

    document.querySelectorAll("[data-hero-zoom]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var src = btn.getAttribute("data-full-src");
        var inner = btn.querySelector("img");
        var alt = inner ? inner.getAttribute("alt") || "" : "";
        if (src) lbOpen(src, alt);
      });
    });

    heroLb.addEventListener("close", function () {
      document.body.classList.remove("hero-lightbox-open");
      lbPanning = false;
      heroLbViewport.classList.remove("is-panning");
    });

    heroLb.querySelectorAll("[data-hero-lightbox-close]").forEach(function (el) {
      el.addEventListener("click", lbClose);
    });

    var zIn = heroLb.querySelector("[data-hero-zoom-in]");
    var zOut = heroLb.querySelector("[data-hero-zoom-out]");
    var zFit = heroLb.querySelector("[data-hero-zoom-fit]");

    if (zIn) {
      zIn.addEventListener("click", function () {
        lbZoom = Math.min(5, Math.round(lbZoom * 1.2 * 100) / 100);
        lbApplyZoom();
      });
    }
    if (zOut) {
      zOut.addEventListener("click", function () {
        lbZoom = Math.max(1, Math.round((lbZoom / 1.2) * 100) / 100);
        lbApplyZoom();
      });
    }
    if (zFit) {
      zFit.addEventListener("click", function () {
        lbZoom = 1;
        lbApplyZoom();
        requestAnimationFrame(lbCenterScroll);
      });
    }

    heroLbViewport.addEventListener(
      "wheel",
      function (e) {
        if (!heroLb.open) return;
        e.preventDefault();
        if (e.deltaY < 0) {
          lbZoom = Math.min(5, Math.round(lbZoom * 1.12 * 100) / 100);
        } else {
          lbZoom = Math.max(1, Math.round((lbZoom / 1.12) * 100) / 100);
        }
        lbApplyZoom();
      },
      { passive: false }
    );

    heroLbViewport.addEventListener("mousedown", function (e) {
      if (!heroLb.open || e.button !== 0) return;
      var el = heroLbViewport;
      var canPan =
        el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2;
      if (!canPan) return;
      lbPanning = true;
      heroLbViewport.classList.add("is-panning");
      lbPanX = e.clientX;
      lbPanY = e.clientY;
      lbPanSl = heroLbViewport.scrollLeft;
      lbPanSt = heroLbViewport.scrollTop;
    });

    window.addEventListener("mousemove", function (e) {
      if (!lbPanning) return;
      var dx = e.clientX - lbPanX;
      var dy = e.clientY - lbPanY;
      lbPanX = e.clientX;
      lbPanY = e.clientY;
      heroLbViewport.scrollLeft -= dx;
      heroLbViewport.scrollTop -= dy;
    });

    window.addEventListener("mouseup", function () {
      if (!lbPanning) return;
      lbPanning = false;
      heroLbViewport.classList.remove("is-panning");
    });

    window.addEventListener(
      "resize",
      function () {
        if (!heroLb.open) return;
        lbApplyZoom();
        requestAnimationFrame(function () {
          if (lbZoom <= 1.001) lbCenterScroll();
        });
      },
      { passive: true }
    );
  }

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (dialog && dialog.open) return;
    var hlb = document.getElementById("hero-lightbox");
    if (hlb && hlb.open) return;
    setNavOpen(false);
  });
})();
