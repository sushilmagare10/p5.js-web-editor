import PropTypes from 'prop-types';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import useKeyDownHandlers from '../../modules/IDE/hooks/useKeyDownHandlers';
import { MenuOpenContext, NavBarContext } from './contexts';

function NavBar({ children, className }) {
  const [dropdownOpen, setDropdownOpen] = useState('none');

  const timerRef = useRef(null);

  const nodeRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (!nodeRef.current) {
        return;
      }
      if (nodeRef.current.contains(e.target)) {
        return;
      }
      setDropdownOpen('none');
    }
    document.addEventListener('mousedown', handleClick, false);
    return () => {
      document.removeEventListener('mousedown', handleClick, false);
    };
  }, [nodeRef, setDropdownOpen]);

  useKeyDownHandlers({
    escape: () => setDropdownOpen('none')
  });

  const clearHideTimeout = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [timerRef]);

  const handleBlur = useCallback(() => {
    timerRef.current = setTimeout(() => setDropdownOpen('none'), 10);
  }, [timerRef, setDropdownOpen]);

  const toggleDropdownOpen = useCallback(
    (dropdown) => {
      setDropdownOpen((prevState) =>
        prevState === dropdown ? 'none' : dropdown
      );
    },
    [setDropdownOpen]
  );

  const contextValue = useMemo(
    () => ({
      createDropdownHandlers: (dropdown) => ({
        onMouseOver: () => {
          setDropdownOpen((prevState) =>
            prevState === 'none' ? 'none' : dropdown
          );
        },
        onClick: () => {
          toggleDropdownOpen(dropdown);
        },
        onBlur: handleBlur,
        onFocus: clearHideTimeout
      }),
      createMenuItemHandlers: (dropdown) => ({
        onMouseUp: (e) => {
          if (e.button === 2) {
            return;
          }
          setDropdownOpen('none');
        },
        onBlur: handleBlur,
        onFocus: () => {
          clearHideTimeout();
          setDropdownOpen(dropdown);
        }
      }),
      toggleDropdownOpen
    }),
    [setDropdownOpen, toggleDropdownOpen, clearHideTimeout, handleBlur]
  );

  return (
    <NavBarContext.Provider value={contextValue}>
      <header>
        <nav className={className} ref={nodeRef}>
          <MenuOpenContext.Provider value={dropdownOpen}>
            {children}
          </MenuOpenContext.Provider>
        </nav>
      </header>
    </NavBarContext.Provider>
  );
}

NavBar.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};

NavBar.defaultProps = {
  children: null,
  className: 'nav'
};

export default NavBar;
