// Language: JavaScript
export default {
    mounted(el, binding) {
      let pressTimer = null;
      const start = (e) => {
        if (pressTimer === null) {
          pressTimer = setTimeout(() => binding.value(e), 600);
        }
      };
      const cancel = () => {
        if (pressTimer !== null) {
          clearTimeout(pressTimer);
          pressTimer = null;
        }
      };
      el.addEventListener('touchstart', start);
      el.addEventListener('touchend', cancel);
      el.addEventListener('mousedown', start);
      el.addEventListener('mouseup', cancel);
      el.addEventListener('mouseleave', cancel);
    }
  };