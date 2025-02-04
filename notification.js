export const notification = (msg, type) => {
    const notification = document.querySelector('.notification');
    const notificationImg = document.querySelector('.notification-icon');
    const notificationType = document.querySelector('.notification-type');
    const notificationMsg = document.querySelector('.notification-message');

    notificationImg.style.width = '10px'
    notificationImg.style.height = '10px'

    if (type === 'error') {
        notification.style.border = '3px solid #bc4523';
        notificationMsg.style.color = '#fff';
        // notification.style.backgroundColor = '#bc452324';
        notificationImg.src = './assets/error.png';
    } else if (type === 'warning') {
        notification.style.border = '3px solid #e6c445';
        notificationMsg.style.color = '#fff';
        // notification.style.backgroundColor = '#e6c44524';
        notificationImg.src = './assets/warning.png';
    } else if (type === 'success') {
        notification.style.border = '3px solid #60b638';
        notificationMsg.style.color = '#fff';
        // notification.style.backgroundColor = '#60b63824';
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
