export default function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div");

  notification.className = `notification ${type}`;

  notification.textContent = message;

  notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === "success" ? "#48bb78" : "#e53e3e"};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10000;
      animation: slideInRight 0.3s ease-out;
    `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}
