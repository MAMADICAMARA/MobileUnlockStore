import { useEffect } from 'react';

/**
 * Bloque le scroll de la page derrière un modal (compatible iOS Safari).
 * @param {boolean} isLocked  true = modal ouvert, false = fermé
 */
const useBodyScrollLock = (isLocked = true) => {
  useEffect(() => {
    if (!isLocked) return;

    const scrollY = window.scrollY;
    document.body.style.top = `-${scrollY}px`;
    document.body.classList.add('modal-open');

    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.top = '';
      window.scrollTo(0, scrollY);
    };
  }, [isLocked]);
};

export default useBodyScrollLock;
