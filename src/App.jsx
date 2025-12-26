import React, { useState, useEffect, useMemo } from 'react';
import { Play, Search, Film, Menu, X, MonitorPlay, Server, LayoutGrid, List } from 'lucide-react';

// M3U URL ของคุณ
const M3U_URL = "https://raw.githubusercontent.com/Zixzorash/IPTV/refs/heads/AV-JAPANESE/JAV_BACKUP.m3u";

// --- Helper Functions ---

const parseM3U = (content) => {
  const lines = content.split('\n');
  const playlist = [];
  let currentItem = null;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF')) {
      if (currentItem) playlist.push(currentItem);
      currentItem = {
        id: i,
        name: (line.match(/tvg-name="([^"]*)"/) || [])[1] || (line.split(',').pop().trim()),
        logo: (line.match(/tvg-logo="([^"]*)"/) || [])[1] || null,
        group: (line.match(/group-title="([^"]*)"/) || [])[1] || "Uncategorized",
        player: (line.match(/tvg-player="([^"]*)"/) || [])[1] || "default",
        subtitles: null,
        urls: []
      };
    } else if (line.startsWith('#EXT-X-MEDIA:TYPE=SUBTITLES')) {
      if (currentItem) {
        const subUri = (line.match(/URI="([^"]*)"/) || [])[1];
        if (subUri) currentItem.subtitles = subUri;
      }
    } else if (line.startsWith('http')) {
      if (currentItem) currentItem.urls.push(line);
    }
  }
  if (currentItem) playlist.push(currentItem);
  return playlist;
};

const generateAnym3uUrl = (videoUrl, subtitleUrl) => {
  let baseUrl = `https://anym3u8player.com/ultimate-player-generator/player.php?player=jwplayer&url=${videoUrl}&autoplay=1&muted=1&controls=auto&theme=default`;
  if (subtitleUrl) {
    baseUrl += `&subtitles=${subtitleUrl}:th:Thai:1`;
  }
  return baseUrl;
};

// --- Components ---

const Navbar = ({ onSearch, searchTerm, toggleSidebar }) => (
  <nav className="fixed top-0 left-0 right-0 h-16 bg-[#0f0f15]/90 backdrop-blur-md border-b border-white/5 z-50 flex items-center px-4 md:px-8 justify-between">
    <div className="flex items-center gap-4">
      <button onClick={toggleSidebar} className="md:hidden text-gray-400 hover:text-white">
        <Menu size={24} />
      </button>
      <div className="flex items-center gap-2 text-purple-500">
        <MonitorPlay size={28} />
        <span className="text-xl font-bold tracking-wider text-white">JAV<span className="text-purple-500">STREAM</span></span>
      </div>
    </div>
    <div className="relative hidden md:block w-96">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
      <input type="text" placeholder="ค้นหาชื่อวิดีโอ..." value={searchTerm} onChange={(e) => onSearch(e.target.value)} className="w-full bg-[#1a1a24] text-gray-200 pl-10 pr-4 py-2 rounded-full border border-white/10 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" />
    </div>
    <div className="flex items-center gap-3">
       <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">U</div>
    </div>
  </nav>
);

const Sidebar = ({ groups, selectedGroup, onSelectGroup, isOpen, onClose }) => (
  <>
    {isOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={onClose} />}
    <aside className={`fixed top-16 left-0 bottom-0 w-64 bg-[#0f0f15] border-r border-white/5 z-40 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} overflow-y-auto custom-scrollbar`}>
      <div className="p-4">
        <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4 px-2">หมวดหมู่</h3>
        <div className="space-y-1">
          <button onClick={() => onSelectGroup('All')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${selectedGroup === 'All' ? 'bg-purple-600/20 text-purple-400' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
            <LayoutGrid size={18} /> ทั้งหมด
          </button>
          {groups.map(group => (
            <button key={group} onClick={() => onSelectGroup(group)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${selectedGroup === group ? 'bg-purple-600/20 text-purple-400' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
              <List size={18} /> <span className="truncate">{group}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  </>
);

const VideoCard = ({ video, onClick }) => {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="group relative bg-[#1a1a24] rounded-xl overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-purple-900/20 transition-all duration-300 hover:-translate-y-1" onClick={() => onClick(video)}>
      <div className="aspect-[2/3] relative overflow-hidden bg-gray-900">
        {!imgError && video.logo ? (
          <img src={video.logo} alt={video.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={() => setImgError(true)} loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600"><Film size={48} /></div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
          <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-lg scale-0 group-hover:scale-100 transition-transform duration-300 delay-75"><Play size={20} fill="currentColor" /></div>
        </div>
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-white border border-white/10">HD</div>
      </div>
      <div className="p-3">
        <h3 className="text-gray-200 font-medium text-sm line-clamp-2 leading-snug group-hover:text-purple-400 transition-colors">{video.name}</h3>
        <p className="text-gray-500 text-xs mt-1 truncate">{video.group}</p>
      </div>
    </div>
  );
};

const VideoPlayerModal = ({ video, onClose }) => {
  const [activeUrlIndex, setActiveUrlIndex] = useState(0);
  if (!video) return null;
  const currentUrl = video.urls[activeUrlIndex];
  const isServer2 = activeUrlIndex === 1;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#1a1a24] w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#0f0f15]">
          <h2 className="text-white font-semibold truncate pr-4">{video.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white bg-white/5 p-2 rounded-full hover:bg-red-500/20 hover:text-red-400 transition-all"><X size={20} /></button>
        </div>
        <div className="w-full bg-black relative group">
          {isServer2 ? (
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', maxWidth: '100%' }}>
              <iframe key={`s2-${currentUrl}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} webkitallowfullscreen="true" mozallowfullscreen="true" allowFullScreen={true} frameBorder="0" allow="autoplay" src={generateAnym3uUrl(currentUrl, video.subtitles)} title="JWPlayer Frame" />
            </div>
          ) : (
            <div className="aspect-video relative">
              <video key={`s1-${currentUrl}`} controls autoPlay className="w-full h-full" poster={video.logo}>
                <source src={currentUrl} type="video/mp4" />
                {video.subtitles && <track label="Thai" kind="subtitles" srcLang="th" src={video.subtitles} default />}
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>
        <div className="p-6 overflow-y-auto">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2"><Server size={14} /> เลือกเซิร์ฟเวอร์</h3>
              <div className="flex flex-wrap gap-2">
                {video.urls[0] && (
                  <button onClick={() => setActiveUrlIndex(0)} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${activeUrlIndex === 0 ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'bg-[#252532] text-gray-400 hover:bg-[#2d2d3d] hover:text-gray-200'}`}>
                    <span>Server 1</span><span className="text-[10px] bg-white/10 px-1 rounded text-gray-300">Default</span>{activeUrlIndex === 0 && <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>}
                  </button>
                )}
                {video.urls[1] && (
                  <button onClick={() => setActiveUrlIndex(1)} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${activeUrlIndex === 1 ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'bg-[#252532] text-gray-400 hover:bg-[#2d2d3d] hover:text-gray-200'}`}>
                    <span>Server 2</span><span className="text-[10px] bg-white/10 px-1 rounded text-gray-300">JWPlayer</span>{activeUrlIndex === 1 && <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>}
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 border-l border-white/5 pl-0 md:pl-6 md:border-l-0 lg:border-l">
               <h3 className="text-white font-medium mb-1">รายละเอียด</h3>
               <p className="text-gray-500 text-sm">หมวดหมู่: <span className="text-purple-400">{video.group}</span></p>
               <p className="text-gray-500 text-sm mt-1 truncate">Playing: <span className="text-gray-300">{isServer2 ? 'Server 2 (JWPlayer)' : 'Server 1 (Native)'}</span></p>
               {video.subtitles && <p className="text-green-500 text-xs mt-2 px-2 py-1 bg-green-500/10 rounded inline-block border border-green-500/20">มีซับไทย</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentVideo, setCurrentVideo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const response = await fetch(M3U_URL);
        if (!response.ok) throw new Error("Network response was not ok");
        const text = await response.text();
        const data = parseM3U(text);
        setVideos(data);
      } catch (err) {
        console.error("Error fetching M3U:", err);
        setError("ไม่สามารถโหลดข้อมูลเพลย์ลิสต์ได้");
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylist();
  }, []);

  const filteredVideos = useMemo(() => videos.filter(video => (selectedGroup === 'All' || video.group === selectedGroup) && video.name.toLowerCase().includes(searchTerm.toLowerCase())), [videos, selectedGroup, searchTerm]);
  const groups = useMemo(() => [...new Set(videos.map(v => v.group).filter(Boolean))].sort(), [videos]);

  if (loading) return <div className="min-h-screen bg-[#0f0f15] flex items-center justify-center"><div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div></div>;
  if (error) return <div className="min-h-screen bg-[#0f0f15] flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-[#0f0f15] font-sans text-gray-100">
      <Navbar onSearch={setSearchTerm} searchTerm={searchTerm} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar groups={groups} selectedGroup={selectedGroup} onSelectGroup={(g) => { setSelectedGroup(g); setSidebarOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="pt-20 md:pl-64 p-4 md:p-8 min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">{selectedGroup === 'All' ? 'วิดีโอทั้งหมด' : selectedGroup}<span className="text-sm font-normal text-gray-500 bg-white/5 px-2 py-0.5 rounded-md ml-2">{filteredVideos.length}</span></h1>
        </div>
        <div className="md:hidden mb-6 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} /><input type="text" placeholder="ค้นหา..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#1a1a24] text-gray-200 pl-10 pr-4 py-2.5 rounded-lg border border-white/10 focus:outline-none focus:border-purple-500" /></div>
        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">{filteredVideos.map(video => <VideoCard key={video.id} video={video} onClick={setCurrentVideo} />)}</div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500"><Film size={48} className="mb-4 opacity-20" /><p>ไม่พบวิดีโอ</p></div>
        )}
      </main>
      {currentVideo && <VideoPlayerModal video={currentVideo} onClose={() => setCurrentVideo(null)} />}
    </div>
  );
}
