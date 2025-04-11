import React from 'react';  
import './NavigationComponent.css';  
import VMNestLogo from '../../images/VMNest_processed.png';  
import ViewMachinesIcon from '../../images/view_machines_icon.png';  
import DashboardIcon from '../../images/dashboard_icon.png';  
import SettingsIcon from '../../images/settings_icon.png';  
import SignOutIcon from '../../images/sign_out_icon.png';  

function NavigationComponent({ onOptionSelect }) {  
  const options = [  
      { label: 'View Machines', icon: ViewMachinesIcon },  
      { label: 'Dashboard', icon: DashboardIcon },  
      { label: 'Settings', icon: SettingsIcon },  
      { label: 'Sign Out', icon: SignOutIcon },  
  ];  

  return (  
      <div className="navigation">  
          <div className="navigation-top">  
              <div className="navigation-logo">  
                  <img src={VMNestLogo} alt="VMNest Logo" className="vmnest-logo" />  
              </div>  
          </div>  
          <div className="navigation-options">  
              {options.map(option => (  
                  <div  
                      key={option.label}  
                      className="navigation-option"  
                      onClick={() => onOptionSelect(option.label)}>  
                      <img src={option.icon} alt={`${option.label} Icon`} className="navigation-icon" />  
                      {option.label}  
                  </div>  
              ))}  
          </div>  
      </div>  
  );  
}  

export default NavigationComponent;