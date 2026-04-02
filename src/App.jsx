import React, { useState, useEffect } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('Welcome');

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900">
      
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 pt-[env(safe-area-inset-top)] sticky top-0 z-10">
        <div className="px-4 py-3 flex justify-center">
          <h1 className="text-[#660000] font-bold text-xl tracking-tight">NEW STUDENT HUB</h1>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto pb-24 p-6">
        {activeTab === 'Welcome' && (
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-black mb-2">Welcome!</h2>
            <div className="h-1 w-12 bg-[#660000] mb-6"></div>
            <p className="text-lg text-gray-600">
              This is your home base. Use the menu below to get started.
            </p>
          </div>
        )}

        {activeTab === 'Checklist' && <ChecklistPage />}
        {activeTab === 'Tech' && <TechPage />}
        {activeTab === 'Printers' && <PrintersPage />}
        {activeTab === 'Resources' && <ResourcesPage />}
        {activeTab === 'Social' && <SocialPage />}
      </main>

      {/* NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)] shadow-lg">
        <div className="flex justify-around items-center h-20">
          {['Welcome', 'Checklist', 'Tech', 'Printers', 'Resources', 'Social'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex flex-col items-center justify-center w-full h-full transition-all ${
                activeTab === tab ? 'text-[#660000] font-bold' : 'text-gray-400 font-medium'
              }`}
            >
              <span className="text-[10px] uppercase tracking-tighter">{tab}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

// --- HELPER COMPONENTS ---
function QuickLinkCard({ title, url, icon }) {
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-2xl shadow-sm active:scale-95 transition-all text-center"
    >
      <span className="text-2xl mb-1">{icon}</span>
      <span className="text-[10px] font-black text-gray-800 leading-tight uppercase tracking-tighter">
        {title}
      </span>
    </a>
  );
}

// --- SHARED PARSER ---
const parseCSV = (text) => {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    if (char === '"' && inQuotes && nextChar === '"') { currentField += '"'; i++; } 
    else if (char === '"') { inQuotes = !inQuotes; } 
    else if (char === ',' && !inQuotes) { currentRow.push(currentField.trim()); currentField = ''; } 
    else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (currentField || currentRow.length > 0) { currentRow.push(currentField.trim()); rows.push(currentRow); }
      currentRow = []; currentField = ''; if (char === '\r' && nextChar === '\n') i++;
    } else { currentField += char; }
  }
  if (currentField || currentRow.length > 0) { currentRow.push(currentField.trim()); rows.push(currentRow); }
  return rows;
};

// --- PAGES ---
function ChecklistPage() {
  const [sections, setSections] = useState({});
  const [checkedItems, setCheckedItems] = useState(() => {
    const saved = localStorage.getItem('student-checklist');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRAUOX5fCQMNE_dW0ZHfMXIcji3DkzuFhohUptbdgvZXU5Fi-rVbPE1jhfmjNT7QXBJFdCQ0l5vIl7b/pub?gid=0&single=true&output=csv')
      .then(res => res.text())
      .then(csvText => {
        const allRows = parseCSV(csvText).slice(1);
        const grouped = {};
        allRows.forEach(columns => {
          const [id, section, title, description, link, linkLabel] = columns;
          if (section && title) {
            if (!grouped[section]) grouped[section] = [];
            grouped[section].push({ id, section, title, description, link, linkLabel });
          }
        });
        setSections(grouped);
      });
  }, []);

  const toggleCheck = (itemTitle) => {
    const updated = { ...checkedItems, [itemTitle]: !checkedItems[itemTitle] };
    setCheckedItems(updated);
    localStorage.setItem('student-checklist', JSON.stringify(updated));
  };

  return (
    <div className="max-w-md mx-auto pb-10">
      <h2 className="text-3xl font-black text-gray-900 mb-6 uppercase tracking-tight">My Checklist</h2>
      {Object.keys(sections).map((sectionName) => (
        <div key={sectionName} className="mb-10">
          <h3 className="text-xl font-bold text-[#660000] mb-1">{sectionName}</h3>
          <div className="h-px bg-gray-300 w-full mb-6"></div>
          <div className="space-y-10">
            {sections[sectionName].map((item, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <button 
                  onClick={() => toggleCheck(item.title)}
                  className={`mt-1 flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                    checkedItems[item.title] ? 'bg-[#660000] border-[#660000]' : 'border-gray-400 bg-white'
                  }`}
                >
                  {checkedItems[item.title] && <span className="text-white text-xs font-bold">✓</span>}
                </button>
                <div className="flex-1">
                  <p className={`text-lg font-bold leading-tight ${checkedItems[item.title] ? 'line-through text-gray-400' : 'text-gray-900'}`}>{item.title}</p>
                  <p className="mt-2 text-gray-600 text-sm leading-relaxed">{item.description}</p>
                  {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-[#660000] font-bold underline text-sm">{item.linkLabel || "Learn More"}</a>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TechPage() {
  const [locations, setLocations] = useState([]);
  useEffect(() => {
    fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vTTOuyLg4Cy2-hHibwrHlOXUtkHTTl-Fl1eEnyrH_Ndz0f8yGyjzdKO7oCmIeHtUhmuBNEJk2Ifo0O3/pub?gid=0&single=true&output=csv')
      .then(res => res.text())
      .then(csvText => setLocations(parseCSV(csvText).slice(1)));
  }, []);

  return (
    <div className="max-w-md mx-auto pb-10">
      <h2 className="text-3xl font-black text-gray-900 mb-6 uppercase tracking-tight text-center">TECH SUPPORT</h2>
      
      {/* 1. BIG HELP BUTTON */}
      <a 
        href="https://help.charleston.edu" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="block w-full bg-[#660000] text-white text-center py-5 rounded-3xl font-black text-xl shadow-lg active:scale-95 transition-transform mb-10"
      >
        GET TECH HELP →
      </a>

      <div className="flex items-center gap-4 mb-6">
        <h3 className="text-[#660000] font-bold uppercase tracking-widest text-xs whitespace-nowrap">Support Locations</h3>
        <div className="h-px bg-gray-300 w-full"></div>
      </div>

      {/* THE GRID: 2 columns to match the Printer page */}
      <div className="grid grid-cols-2 gap-4">
        {locations.map((loc, idx) => {
          // Destructure current 5 columns + potential 6th imageURL column
          const [building, floor, mapURL, lat, lng, imageURL] = loc;
          const mapLink = lat && lng ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` : mapURL;

          return (
            <a 
              key={idx} 
              href={mapLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden active:scale-95 transition-all"
            >
              {/* Image area with fallback icon */}
              <div className="w-full h-32 bg-gray-50 overflow-hidden">
                {imageURL && imageURL.startsWith('http') ? (
                  <img 
                    src={imageURL} 
                    alt={building} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#660000]/20">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Text area shrunken for grid */}
              <div className="p-3">
                <p className="text-sm font-black text-gray-900 leading-tight truncate">
                  {building}
                </p>
                <p className="text-[#660000] font-bold text-[10px] uppercase tracking-wider mt-1">
                  {floor}
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

function PrintersPage() {
  const [printers, setPrinters] = useState([]);
  
  useEffect(() => {
    fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vSvmD7xg-xTdqw5QWIf-XnFS1YZtyK9UY-hgTAWoanvmHH_043QZSBTNW7o9oDoFVEIrOR8dO4aym19/pub?gid=0&single=true&output=csv')
      .then(res => res.text())
      .then(csvText => setPrinters(parseCSV(csvText).slice(1)));
  }, []);

  return (
    <div className="max-w-md mx-auto pb-10">
      <h2 className="text-3xl font-black text-gray-900 mb-6 uppercase tracking-tight text-center">PRINTERS</h2>
      
      {/* THE GRID CONTAINER: 2 columns with a small gap */}
      <div className="grid grid-cols-2 gap-4">
        
        {printers.map((printer, idx) => {
          const [building, floor, description, hours, phone, mapURL, lat, lng, imageURL] = printer;
          const mapLink = lat && lng ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` : mapURL;

          return (
            <a 
              key={idx} 
              href={mapLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden active:scale-95 transition-all"
            >
              {/* Image adjusted for Square Gallery */}
              <div className="w-full h-32 bg-gray-100 overflow-hidden">
                {imageURL && imageURL.startsWith('http') ? (
                  <img 
                    src={imageURL} 
                    alt={building} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  // Fallback if no image: Show a printer icon
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Text content shrunk slightly for the grid */}
              <div className="p-3">
                <p className="text-sm font-black text-gray-900 leading-tight truncate">
                  {building}
                </p>
                <p className="text-[#660000] font-bold text-[10px] uppercase tracking-wider mt-1">
                  {floor}
                </p>
                {/* We hide the description in gallery view to keep it clean, 
                    or show a tiny version: */}
                <p className="text-gray-400 text-[10px] mt-1 line-clamp-1 italic">
                  {description}
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

function ResourcesPage() {
  const [resources, setResources] = useState([]);

  useEffect(() => {
    fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vTcxhb5Y082FSNgrv8ONVqLWhiNhi1ByHca00JY0fdXCPUHGe0fRQGwT6rXk5konOvg81b7oBCBtSb_/pub?gid=0&single=true&output=csv')
      .then(res => res.text())
      .then(csvText => setResources(parseCSV(csvText).slice(1)));
  }, []);

  return (
    <div className="max-w-md mx-auto pb-10">
      <h2 className="text-3xl font-black text-gray-900 mb-6 uppercase tracking-tight text-center">RESOURCES</h2>

      {/* TOP SECTION: QUICK ACTION CARDS (3-column) */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        <QuickLinkCard title="Service Desk" url="https://help.charleston.edu" icon="🛠️" />
        <QuickLinkCard title="Password" url="https://passwordreset.microsoftonline.com/" icon="🔑" />
        <QuickLinkCard title="Status" url="https://status.cofc.edu" icon="🚦" />
      </div>

      {/* DIVIDER */}
      <div className="flex items-center gap-4 mb-6">
        <h3 className="text-[#660000] font-bold uppercase tracking-widest text-xs whitespace-nowrap">Links & Tools</h3>
        <div className="h-px bg-gray-300 w-full"></div>
      </div>

      {/* BOTTOM SECTION: GALLERY GRID (2-column) */}
      <div className="grid grid-cols-2 gap-4">
        {resources.map((res, idx) => {
          // Headers: name, link
          const [name, link] = res;
          
          return (
            <a 
              key={idx} 
              href={link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-gray-200 shadow-sm active:scale-95 transition-all text-center min-h-[120px]"
            >
              {/* Modern Link Icon */}
              <div className="text-[#660000] mb-3 opacity-80">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              
              <span className="font-bold text-gray-900 text-sm leading-tight uppercase tracking-tight">
                {name}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

function SocialPage() {
  const socialLinks = [
    { name: 'Instagram', url: 'https://www.instagram.com/cofc_it/', color: 'bg-[#2f9e91]', icon: '📸', handle: '@cofc_it' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/company/college-of-charleston-information-technology/', color: 'bg-[#4ad4c4]', icon: '💼', handle: 'CofC IT' },
    { name: 'YouTube', url: 'https://www.youtube.com/@collegeofcharlestoninforma6003', color: 'bg-[#ff6065]', icon: '📺', handle: 'CofC IT Channel' }
  ];

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">STAY CONNECTED</h2>
        <p className="text-gray-500 font-medium mt-1 text-sm">Follow CofC IT for updates & alerts</p>
      </div>
      <div className="space-y-4">
        {socialLinks.map((link) => (
          <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className={`flex items-center p-6 rounded-3xl text-white shadow-lg active:scale-95 transition-all ${link.color}`}>
            <span className="text-4xl mr-6">{link.icon}</span>
            <div>
              <span className="block text-xl font-bold uppercase tracking-wider leading-none">{link.name}</span>
              <span className="text-xs font-medium opacity-90 mt-1 block">{link.handle}</span>
            </div>
          </a>
        ))}
      </div>
      <div className="mt-16 text-center">
        <div className="h-1 w-12 bg-[#660000] mx-auto mb-4 rounded-full"></div>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">College of Charleston • IT</p>
      </div>
    </div>
  );
}