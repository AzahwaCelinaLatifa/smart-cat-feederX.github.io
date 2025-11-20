import React, { useState } from 'react';
import Profile from '@/pages/profile';

interface ProfileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileSidebar({ isOpen, onClose }: ProfileSidebarProps) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Profile Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          borderLeft: '2px solid #174143',
          backgroundColor: '#ffffff',
          width: '400px'
        }}
      >
        {/* Background gradient di pojok atas */}
        <div 
          className="absolute top-0 left-0"
          style={{
            width: '390px',
            height: '214px',
            flexShrink: 0,
            borderRadius: '0',
            opacity: 0.9,
            background: 'linear-gradient(180deg, rgba(66, 122, 118, 0.80) 0%, rgba(245, 229, 225, 0.90) 50%, #FFF 100%)',
            zIndex: -1
          }}
        />
        

        
        {/* Header with X button only */}
        <div className="flex items-center justify-end px-6 py-3">
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200"
            style={{color: '#174143'}}
          >
            <img 
              src="/assets/stash_times.png"
              alt="Close"
              style={{
                width: '29px',
                height: '29px',
                flexShrink: 0,
                aspectRatio: '1/1',
                objectFit: 'contain',
                filter: 'none'
              }}
            />
          </button>
        </div>
        
        {/* Profile Content */}
        <div className="px-6 h-full overflow-auto" style={{fontFamily: 'Montserrat', color: '#174143'}}>
          <Profile />
        </div>
      </div>
    </>
  );
}