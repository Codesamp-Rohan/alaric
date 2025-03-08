export const notification = (msg, type) => {
    const notification = document.querySelector('.notification');
    const notificationImg = document.querySelector('.notification-icon');
    const notificationType = document.querySelector('.notification-type');
    const notificationMsg = document.querySelector('.notification-message');

    notificationImg.style.width = '20px'
    notificationImg.style.height = '20px'

    if (type === 'error') {
        notificationImg.src = './assets/error.png';
    } else if (type === 'warning') {
        notificationImg.src = './assets/warning.png';
    } else if (type === 'success') {
        notificationImg.src = './assets/success.png';
    }

    notificationType.textContent = type;
    notificationMsg.textContent = msg;
    
    setTimeout(() => {
        notification.classList.add('notification-active');
    }, 100);
    setTimeout(() => {
        notification.classList.remove('notification-active');
    }, 3000);
};
