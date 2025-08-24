
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    const location = useLocation();
    useEffect(() => {
        try {
            window.scrollTo({
                top: 0,
                left: 0,
            });
        } catch (e) {
            window.scrollTo(0, 0);
        }
    }, [location]); 

    return null;
};

export default ScrollToTop;