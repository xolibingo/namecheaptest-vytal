import React, { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  Heart, 
  MessageSquare, 
  Plus, 
  UserMinus, 
  ShieldAlert, 
  Clock, 
  Filter, 
  Search,
  CornerDownRight,
  ArrowRight,
  Sparkles,
  Baby
} from "lucide-react";

interface ForumReply {
  id: string;
  author: string;
  content: string;
  reported: boolean;
  createdAt: string;
}

interface ForumPost {
  id: string;
  author: string;
  gestationalWeeks: number;
  category: "nausea" | "movement" | "appointments" | "nutrition" | "support";
  title: string;
  content: string;
  reported: boolean;
  createdAt: string;
  replies: ForumReply[];
}

// Pre-seeded authentic community discussions matching southern Africa context
const INITIAL_POSTS: ForumPost[] = [
  {
    id: "post-1",
    author: "Nomsa Mlandvo",
    gestationalWeeks: 9,
    category: "nausea",
    title: "Overcoming severe nausea with iron daily pills",
    content: "Greetings sisters! I am in week 9. The clinic doctor asked me to take iron and folic acid, but the nausea is making it very hard to keep anything down in the morning. Anyone has any working tips or natural remedies?",
    reported: false,
    createdAt: "Just now",
    replies: [
      {
        id: "rep-1-1",
        author: "Zanele Ndlangamandla",
        content: "Yebo sister Nomsa, try drinking fresh ginger tea with a dash of wild lemon right before getting out of bed. It has helped protect my stomach massively!",
        reported: false,
        createdAt: "5 minutes ago"
      },
      {
        id: "rep-1-2",
        author: "Sister Thandeka Kunene",
        content: "Registered Mother Nomsa, you can try taking your prenatal iron tabs immediately after a heavy dinner with warm milk or vitamin C juice. The citrus speeds up safe bio-absorption.",
        reported: false,
        createdAt: "3 minutes ago"
      }
    ]
  },
  {
    id: "post-2",
    author: "Kelebogile Mokgoro",
    gestationalWeeks: 28,
    category: "movement",
    title: "Womb flutters turned into gymnastics!",
    content: "Our baby has grown so strong! I was sitting quietly yesterday evening listening to some ambient music in Siteki, and I felt continuous rolling kicks. It is such a blessing and relief. How often does your baby kick?",
    reported: false,
    createdAt: "3 hours ago",
    replies: [
      {
        id: "rep-2-1",
        author: "Lerato Khumalo",
        content: "It is beautiful! At week 28, you should look out for about 10 kicks within a 2-hour window during active periods. The kick log tab in our app is great for this!",
        reported: false,
        createdAt: "2 hours ago"
      }
    ]
  },
  {
    id: "post-3",
    author: "Palesa Sebatane",
    gestationalWeeks: 32,
    category: "appointments",
    title: "Mbabane Primary Clinic check-up tomorrow",
    content: "I have my week 32 fetal biometrics and blood pressure check-up scheduled for tomorrow at 8:00 AM. Wishing all the expecting mothers of our community a peaceful clinic day! Let us go together to receive vitamins.",
    reported: false,
    createdAt: "Yesterday",
    replies: []
  },
  {
    id: "post-4",
    author: "Tebogo Mokgoko",
    gestationalWeeks: 16,
    category: "nutrition",
    title: "Native pumpkin seeds and spinach as snacks",
    content: "My community health worker told me to snack on pumpkin seeds because they are packed with natural magnesium, iron, and zinc. Truly feeling less fatigued during my farm walks!",
    reported: false,
    createdAt: "2 days ago",
    replies: [
      {
        id: "rep-4-1",
        author: "Mpho Dlamini",
        content: "That is a gold standard tip, Tebogo! I will dry some seeds from my garden harvest today too.",
        reported: false,
        createdAt: "1 day ago"
      }
    ]
  },
  {
    id: "post-5",
    author: "Gugu Gamedze",
    gestationalWeeks: 35,
    category: "support",
    title: "Preparing my hospital bag - what are your essentials?",
    content: "As I enter week 35, my husband and I are packing. We have baby blankets, diapers, a change of clothes, and clean cotton cloths. What was your most forgotten item at the maternity center?",
    reported: false,
    createdAt: "3 days ago",
    replies: [
      {
        id: "rep-5-1",
        author: "Sister Thandeka Kunene",
        content: "Excellent preparation Gugu! Remember to pack your medical pregnancy log book and clinic registry cards. Those are the first papers the clinic nurses will ask for.",
        reported: false,
        createdAt: "2 days ago"
      }
    ]
  }
];

export default function ConnectionsFeed({ currentWeeks }: { currentWeeks: number }) {
  // Feed posts and block/report lists
  const [posts, setPosts] = useState<ForumPost[]>(() => {
    const cached = localStorage.getItem("vytal_forum_posts_v1");
    return cached ? JSON.parse(cached) : INITIAL_POSTS;
  });

  const [blockedUsers, setBlockedUsers] = useState<string[]>(() => {
    const cached = localStorage.getItem("vytal_blocked_users");
    return cached ? JSON.parse(cached) : [];
  });

  // Filter and input management
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  // New post fields
  const [newPostAuthor, setNewPostAuthor] = useState("Anonymous Mother");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState<"nausea" | "movement" | "appointments" | "nutrition" | "support">("support");

  // New reply fields
  const [replyAuthor, setReplyAuthor] = useState("Anonymous Mother");
  const [replyContent, setReplyContent] = useState("");

  // Rate Limiting Anti-Spam state
  const [lastPostedTime, setLastPostedTime] = useState<number>(0);
  const [spamTimer, setSpamTimer] = useState<number>(0);

  // Persistence hooks
  useEffect(() => {
    localStorage.setItem("vytal_forum_posts_v1", JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem("vytal_blocked_users", JSON.stringify(blockedUsers));
  }, [blockedUsers]);

  // Anti-spam countdown clock logic
  useEffect(() => {
    if (spamTimer > 0) {
      const interval = setInterval(() => {
        setSpamTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [spamTimer]);

  // Handle reporting a post/reply
  const handleReportPost = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, reported: true };
      }
      return p;
    }));
    alert("Thank you. This post has been reported for moderation review. The Vytal Bridge system monitors our board continuously.");
  };

  const handleReportReply = (postId: string, replyId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          replies: p.replies.map(r => r.id === replyId ? { ...r, reported: true } : r)
        };
      }
      return p;
    }));
    alert("Reply reported successfully. Our medical community safety officers will inspect this within 4 hours.");
  };

  // Handle blocking a user
  const handleBlockUser = (username: string) => {
    if (!username || username === "Sister Thandeka Kunene") {
      alert("You cannot block clinic midwives or healthcare supervisors.");
      return;
    }
    if (confirm(`Are you sure you want to block all content and messages posted by ${username}?`)) {
      setBlockedUsers(prev => [...prev, username]);
    }
  };

  // Handle posting a new thread with rate limiting
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check Rate Limiting Spam Gate
    const currentTime = Date.now();
    const timeDelta = (currentTime - lastPostedTime) / 1000;
    if (timeDelta < 10) {
      setSpamTimer(Math.ceil(10 - timeDelta));
      return;
    }

    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    const newPost: ForumPost = {
      id: `post-${Date.now()}`,
      author: newPostAuthor.trim() || "Expecting Mother",
      gestationalWeeks: currentWeeks,
      category: newPostCategory,
      title: newPostTitle.trim(),
      content: newPostContent.trim(),
      reported: false,
      createdAt: "Just now",
      replies: []
    };

    setPosts([newPost, ...posts]);
    setLastPostedTime(currentTime);
    setNewPostTitle("");
    setNewPostContent("");
    setShowNewPostModal(false);
  };

  // Handle posting a comment to a thread with rate limiting
  const handleCreateReply = (e: React.FormEvent, postId: string) => {
    e.preventDefault();
    
    // Check Rate Limiting Spam Gate
    const currentTime = Date.now();
    const timeDelta = (currentTime - lastPostedTime) / 1000;
    if (timeDelta < 10) {
      setSpamTimer(Math.ceil(10 - timeDelta));
      return;
    }

    if (!replyContent.trim()) return;

    const newReply = {
      id: `rep-${Date.now()}`,
      author: replyAuthor.trim() || "Anonymous Mother",
      content: replyContent.trim(),
      reported: false,
      createdAt: "Just now"
    };

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, replies: [...p.replies, newReply] };
      }
      return p;
    }));

    setLastPostedTime(currentTime);
    setReplyContent("");
  };

  // Categories helper list
  const CATEGORIES = [
    { id: "all", label: "All Topics", emoji: "📢" },
    { id: "nausea", label: "Nausea", emoji: "🤢" },
    { id: "movement", label: "Movement", emoji: "👶" },
    { id: "appointments", label: "Clinics", emoji: "🏥" },
    { id: "nutrition", label: "Nutrition", emoji: "🥦" },
    { id: "support", label: "Support", emoji: "🌸" }
  ];

  // Filters posts by blocked users, category, and queries
  const filteredPosts = posts
    .filter(p => !blockedUsers.includes(p.author))
    .filter(p => activeCategory === "all" || p.category === activeCategory)
    .filter(p => {
      const q = searchQuery.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || p.author.toLowerCase().includes(q);
    });

  const activeThread = posts.find(t => t.id === activeThreadId);

  return (
    <div className="space-y-4 animate-fade-in text-left font-sans" id="connections-main-feed">
      
      {/* 🚨 Clinical High-Priority Safety Advisory Banner */}
      <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-300 rounded-2xl p-4 flex gap-3 text-red-900 shadow-xs" id="forum-clinical-guidelines-banner">
        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5 animate-pulse" />
        <div className="text-[11px] space-y-1">
          <h4 className="font-extrabold uppercase tracking-wider text-red-800">Local Medical Dispatch Advisory</h4>
          <p className="leading-relaxed font-semibold">
            This peer connection board is for non-clinical shared wisdom and mutual support only.
          </p>
          <p className="text-red-700/95 font-medium">
            <b>WARNING:</b> If you are experiencing bleeding, severe pelvic pain, continuous vomiting, facial swelling, or diminished baby movement, <b>skip the board and visit your nearest medical clinic or consult a real doctor immediately!</b>
          </p>
        </div>
      </div>

      {/* Floating Sparkly Flower Header with Glassmorphism */}
      <div className="relative p-5 bg-gradient-to-br from-[#FFF2EE] via-[#FFF8FA] to-[#F5EEFF] border border-white/60 rounded-3xl shadow-sm overflow-hidden flex flex-col justify-end" id="connections-maternal-hero">
        <div className="absolute top-2 right-2 opacity-15 select-none text-pink-300 pointer-events-none">
          <Baby className="w-24 h-24 rotate-12" />
        </div>
        <div className="relative space-y-1 z-10">
          <div className="flex items-center gap-1.5 text-pink-500 font-bold text-[10px] uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> Expecting Motherhood Connections
          </div>
          <h3 className="text-base font-extrabold text-[#3D2D30] tracking-tight font-sans">
            Maternal Community Circle
          </h3>
          <p className="text-[10px] text-pink-700 font-medium">
            Join other expecting mothers to find comfort, discuss weekly milestones, and swap warm tips safely.
          </p>
        </div>
      </div>

      {/* Search and Category navigation bar */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-bento-muted" />
          <input
            type="text"
            placeholder="Search discussions (e.g. ginger, kicks)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-white border border-bento-border rounded-xl focus:border-pink-300 outline-none transition-all placeholder:text-bento-muted"
          />
        </div>

        {/* Scrollable Category Tag Pills */}
        <div className="overflow-x-auto flex gap-1.5 pb-1 select-none no-scrollbar scroll-smooth" id="forum-category-pills">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setActiveThreadId(null);
              }}
              className={`text-[10px] font-extrabold py-2 px-3 rounded-lg shrink-0 transition-all flex items-center gap-1 cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-xs"
                  : "bg-white border border-bento-border text-bento-body hover:bg-pink-50/40"
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Rate Limit Anti-Spam Indicator */}
      {spamTimer > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[10px] text-red-700 font-bold flex items-center gap-2 animate-bounce">
          <Clock className="w-3.5 h-3.5 animate-spin" />
          <span><b>Anti-Spam Shield:</b> Please wait <b>{spamTimer}s</b> before posting again to keep the community healthy.</span>
        </div>
      )}

      {/* Primary thread router */}
      {!activeThreadId ? (
        <div className="space-y-3" id="forum-threads-list">
          {/* Create Topic Trigger */}
          <button
            onClick={() => {
              if (spamTimer > 0) {
                alert(`Please wait ${spamTimer} seconds for the anti-spam timer.`);
                return;
              }
              setShowNewPostModal(true);
            }}
            className="w-full py-2.5 bg-[#FFF2F0] hover:bg-pink-50 border border-pink-200 hover:border-pink-300 text-pink-700 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
            id="btn-trigger-new-post"
          >
            <Plus className="w-4 h-4" /> Start New Discussion Segment
          </button>

          {/* New Discussion Form Modal Panel */}
          {showNewPostModal && (
            <form onSubmit={handleCreatePost} className="p-4 bg-white/90 backdrop-blur-md border border-pink-200 rounded-2xl space-y-3 mt-2 shadow-lg animate-scale-up">
              <div className="flex justify-between items-center pb-2 border-b border-bento-border">
                <span className="text-[10px] font-extrabold text-pink-600 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Start Discussion
                </span>
                <button 
                  type="button" 
                  onClick={() => setShowNewPostModal(false)}
                  className="text-xs text-bento-muted font-bold hover:text-bento-text"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-[9px] font-extrabold uppercase tracking-widest text-bento-muted mb-1">Your Name / Handle</label>
                  <input
                    type="text"
                    value={newPostAuthor}
                    onChange={(e) => setNewPostAuthor(e.target.value)}
                    placeholder="e.g. Nomsa M."
                    maxLength={30}
                    className="w-full p-2 bg-bento-bg border border-bento-border rounded-lg outline-none focus:border-pink-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-extrabold uppercase tracking-widest text-bento-muted mb-1">Select Topic Tag</label>
                  <select
                    value={newPostCategory}
                    onChange={(e: any) => setNewPostCategory(e.target.value)}
                    className="w-full p-2 bg-bento-bg border border-bento-border rounded-lg outline-none focus:border-pink-300"
                  >
                    <option value="nausea">Nausea (🤢)</option>
                    <option value="movement">Movement (👶)</option>
                    <option value="appointments">Clinics / Checkups (🏥)</option>
                    <option value="nutrition">Nutrition / Supplements (🥦)</option>
                    <option value="support">General Support (🌸)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-extrabold uppercase tracking-widest text-bento-muted mb-1">Discussion Title</label>
                  <input
                    type="text"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder="Brief summary of your topic..."
                    maxLength={60}
                    className="w-full p-2 bg-bento-bg border border-bento-border rounded-lg outline-none focus:border-pink-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-extrabold uppercase tracking-widest text-[#5C5C59] mb-1">Your Story / Question</label>
                  <textarea
                    rows={3}
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Sisters, I wanted to ask..."
                    className="w-full p-2 bg-bento-bg border border-bento-border rounded-lg outline-none focus:border-pink-300 resize-none"
                    required
                  ></textarea>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all uppercase tracking-wider"
              >
                Post to Discussion Board
              </button>
            </form>
          )}

          {/* Posts Feed Listings */}
          <div className="space-y-3" id="posts-feed-listings">
            {filteredPosts.length === 0 ? (
              <div className="p-8 text-center bg-white border border-bento-border rounded-2xl space-y-1.5 shadow-sm">
                <span className="text-xl">🌸</span>
                <p className="text-xs text-bento-muted font-bold italic">No active matching topic threads found.</p>
                <p className="text-[10px] text-bento-muted font-medium">Reset filters or start a brand new topic above!</p>
              </div>
            ) : (
              filteredPosts.map((post) => {
                const categoryModel = CATEGORIES.find(c => c.id === post.category);
                return (
                  <div 
                    key={post.id} 
                    className={`p-4 bg-white/70 backdrop-blur-md rounded-2xl border transition-all shadow-2xs hover:shadow-xs text-left ${
                      post.reported ? "border-amber-200 bg-amber-50/20" : "border-bento-border hover:border-pink-200"
                    }`}
                  >
                    {/* Post metadata header */}
                    <div className="flex justify-between items-center gap-1.5 pb-2.5 border-b border-[#F1F0EA]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">{categoryModel?.emoji || "🌸"}</span>
                        <div>
                          <span className="text-[10px] bg-pink-100 text-pink-700 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                            {post.category}
                          </span>
                        </div>
                      </div>
                      <div className="text-[9px] font-mono text-bento-muted font-bold">
                        {post.author} (Week {post.gestationalWeeks}) • {post.createdAt}
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="pt-2.5 pb-3">
                      {post.reported ? (
                        <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 p-2 rounded-lg text-[10px] font-bold mb-2">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>This discussion is undergoing clinical safety review with Sister Thandeka Kunene.</span>
                        </div>
                      ) : null}

                      <h4 className="font-bold text-xs text-[#2D2D2D] tracking-tight">{post.title}</h4>
                      <p className="text-[11px] text-bento-body mt-1 font-medium leading-relaxed line-clamp-3">
                        {post.content}
                      </p>
                    </div>

                    {/* Report / Block Action drawer */}
                    <div className="pt-2 border-t border-[#F1F0EA] flex items-center justify-between text-[10px]">
                      
                      {/* Safety Actions */}
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleReportPost(post.id)}
                          className="text-amber-600 hover:text-amber-800 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                          title="Report post as unsafe or medical noise"
                        >
                          <ShieldAlert className="w-3 h-3" /> Report
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBlockUser(post.author)}
                          className="text-red-500 hover:text-red-700 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                          title={`Block all future messages from ${post.author}`}
                        >
                          <UserMinus className="w-3 h-3" /> Block User
                        </button>
                      </div>

                      {/* Click into Discussion replies */}
                      <button
                        type="button"
                        onClick={() => setActiveThreadId(post.id)}
                        className="text-pink-600 hover:text-pink-800 font-extrabold uppercase tracking-widest flex items-center gap-1 cursor-pointer bg-pink-100/40 hover:bg-pink-100/80 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> {post.replies.length} replies <ArrowRight className="w-3 h-3 ml-0.5" />
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Thread Detail discussion page view */
        <div className="space-y-4 animate-scale-up" id="discussion-thread-detail">
          
          <button
            onClick={() => setActiveThreadId(null)}
            className="text-xs text-bento-muted font-bold hover:text-bento-text flex items-center gap-1 pb-1"
          >
            ← Back to Community Grid
          </button>

          {activeThread && (
            <div className="p-4 bg-white border border-bento-border rounded-2xl text-left space-y-3.5">
              
              <div className="pb-3 border-b border-bento-border text-[10px] font-mono text-bento-muted flex justify-between">
                <span>POSTER: <b className="text-bento-text">{activeThread.author}</b> (Week {activeThread.gestationalWeeks})</span>
                <span>{activeThread.createdAt}</span>
              </div>

              <div>
                <h3 className="font-extrabold text-xs text-bento-text uppercase tracking-wider">{activeThread.title}</h3>
                <p className="text-xs text-bento-body mt-2.5 bg-bento-bg/30 p-3.5 border border-bento-border/40 rounded-xl leading-relaxed font-medium">
                  {activeThread.content}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleReportPost(activeThread.id)}
                  className="text-[9px] text-amber-600 font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer bg-amber-50 px-2.5 py-1 rounded-lg"
                >
                  <ShieldAlert className="w-3 h-3" /> Report Main Post
                </button>
                <button
                  type="button"
                  onClick={() => handleBlockUser(activeThread.author)}
                  className="text-[9px] text-red-500 font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer bg-red-50 px-2.5 py-1 rounded-lg"
                >
                  <UserMinus className="w-3 h-3" /> Block poster {activeThread.author}
                </button>
              </div>

              {/* Comments Feed list */}
              <div className="space-y-2 pt-2 border-t border-bento-border">
                <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[#5C5C59]">Community Replies ({activeThread.replies.length})</h4>
                
                {activeThread.replies.filter(r => !blockedUsers.includes(r.author)).map((rep) => (
                  <div key={rep.id} className="p-3 bg-[#FCFAF6]/60 border border-bento-border/70 rounded-xl flex gap-2.5 items-start">
                    <CornerDownRight className="w-4 h-4 text-bento-sage shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center text-[9px] font-mono font-bold text-bento-muted">
                        <span>{rep.author}</span>
                        <span>{rep.createdAt}</span>
                      </div>

                      {rep.reported ? (
                        <span className="text-[9px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded block font-bold">⚠️ Flagged/Reported. Under safety review.</span>
                      ) : (
                        <p className="text-[11px] text-bento-body font-semibold leading-relaxed">
                          {rep.content}
                        </p>
                      )}

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleReportReply(activeThread.id, rep.id)}
                          className="text-[8px] text-amber-600 hover:text-amber-800 font-bold uppercase"
                        >
                          Report
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBlockUser(rep.author)}
                          className="text-[8px] text-red-500 hover:text-red-700 font-bold uppercase"
                        >
                          Block {rep.author}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Live Add Reply input form */}
              <form onSubmit={(e) => handleCreateReply(e, activeThread.id)} className="space-y-2 pt-3 border-t border-bento-border">
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <label className="block font-bold text-bento-muted mb-0.5">Reply Name</label>
                    <input
                      type="text"
                      value={replyAuthor}
                      onChange={(e) => setReplyAuthor(e.target.value)}
                      maxLength={15}
                      className="w-full p-2 border border-bento-border rounded-lg outline-none bg-[#FFFDFC]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <textarea
                    rows={2}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Encourage your sister..."
                    className="w-full text-xs p-2 border border-bento-border rounded-xl outline-none focus:border-pink-300 resize-none bg-[#FFFDFC]"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-pink-500 hover:bg-pink-600 text-white text-[10px] uppercase font-bold tracking-wider rounded-xl transition-colors"
                >
                  Post Reply
                </button>
              </form>

            </div>
          )}
        </div>
      )}

    </div>
  );
}
