import React from 'react';
import * as styles from './Navbar.module.css';
import NavigationBar from './NavigationBar/NavigationBar';
import ServicesBar from './ServicesBar/ServicesBar';

const Navbar = props => {
    return (
        <div className={styles['navbar']}>
            <NavigationBar
                active={props.active}
                onUserRoleSwitch={props.onUserRoleSwitch}
                navItems={props.navItems}
                onAuthInit={props.onAuthInit}
                notifications={props.notifications}></NavigationBar>
            <ServicesBar clicked={props.onNavbarSelectKeyword}></ServicesBar>
        </div>
    )
}

export default Navbar;