import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';

// --- INTERFACE ---
interface Widget {
  id: string;
  name: string;
  type: string;
  settings: {
    text?: string; offerText?: string; couponCode?: string; prefixText?: string;
    suffixText?: string; headline?: string; description?: string; buttonText?: string;
    successMessage?: string; messageTemplate?: string; sourceWidgetId?: string;
    endDate?: string; expiredMessage?: string; socials?: Record<string, boolean>;
    questionText?: string; thankYouMessage?: string; videoUrl?: string;
    cookieMessage?: string; cookieButtonText?: string;
    // Properti kustomisasi baru
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
    displayDelay?: number;
    displayDuration?: number;
    logoUrl?: string;
    notifications?: {
      email?: { enabled?: boolean; to?: string; };
      webhook?: { enabled?: boolean; url?: string; };
      slack?: { enabled?: boolean; url?: string; };
      discord?: { enabled?: boolean; url?: string; };
      telegram?: { enabled?: boolean; botToken?: string; chatId?: string; };
      teams?: { enabled?: boolean; url?: string; };
    }
  };
}

const availableSocials = ['facebook', 'twitter', 'linkedin', 'whatsapp', 'telegram'];
const availableFonts = ['Inter', 'Poppins', 'Roboto', 'Lato', 'Montserrat'];

export default function WidgetListPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false); // true if user is subscribed

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeScript, setActiveScript] = useState<{ id: string; code: string } | null>(null);

  // State Form Umum
  const [widgetType, setWidgetType] = useState('informational');
  const [widgetName, setWidgetName] = useState('');

  // State Form Spesifik per Widget
  const [infoText, setInfoText] = useState('');
  const [headingText, setHeadingText] = useState('');
  const [offerText, setOfferText] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [prefixText, setPrefixText] = useState('');
  const [suffixText, setSuffixText] = useState('');
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [messageTemplate, setMessageTemplate] = useState('');
  const [sourceWidgetId, setSourceWidgetId] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expiredMessage, setExpiredMessage] = useState('');
  const [socials, setSocials] = useState<Record<string, boolean>>({ facebook: true, twitter: true });
  const [questionText, setQuestionText] = useState('');
  const [thankYouMessage, setThankYouMessage] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [cookieMessage, setCookieMessage] = useState('');
  const [cookieButtonText, setCookieButtonText] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#2c3e50');
  const [buttonTextColor, setButtonTextColor] = useState('#2c3e50');

  
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [displayDelay, setDisplayDelay] = useState(0);
  const [displayDuration, setDisplayDuration] = useState(0); // 0 berarti tidak hilang otomatis
  const [logoUrl, setLogoUrl] = useState('');
  
const [position, setPosition] = useState("top-left");
const positions = [
  "top-left",
  "top-right", 
  "bottom-left",
  "bottom-right",
];


  // State untuk notifikasi
  const [enableEmailNotifications, setEnableEmailNotifications] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState('');
  const [enableWebhookNotifications, setEnableWebhookNotifications] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [enableSlackNotifications, setEnableSlackNotifications] = useState(false);
  const [slackWebhookUrl, setSlackWebhookUrl] = useState('');
  const [enableDiscordNotifications, setEnableDiscordNotifications] = useState(false);
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState('');
  const [enableTelegramNotifications, setEnableTelegramNotifications] = useState(false);
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [enableTeamsNotifications, setEnableTeamsNotifications] = useState(false);
  const [teamsWebhookUrl, setTeamsWebhookUrl] = useState('');

  const emailCollectorWidgets = useMemo(() => widgets.filter(w => w.type === 'email_collector'), [widgets]);

  const fetchWidgets = useCallback(async () => {
    if (!workspaceId) return;
    try {
      setLoading(true);
      const response = await apiClient.get(`/workspaces/${workspaceId}/widgets`);
      console.log("response.data ::",response.data.widgets)
      setWidgets(response.data.widgets);
      setIsSubscribed(response.data.isSubscribed);
    } catch (err) {
      setError('Failed to fetch widgets.');
    } finally { setLoading(false); }
  }, [workspaceId]);


const onCreateWidget = () => {
  if (!isSubscribed && widgets.length >= 1) {
    toast.error("Please subscribe first to create more widgets");
    return;
  }

  // Open widget creation modal
  setIsModalOpen(true);
};

  useEffect(() => {
    fetchWidgets();
  }, [fetchWidgets]);

  const handleSocialChange = (platform: string) => {
    setSocials(prev => ({ ...prev, [platform]: !prev[platform] }));
  };

  const resetAllForms = () => {
    // Reset semua state form ke nilai awal
    setWidgetName(''); setInfoText(''); setOfferText(''); setCouponCode('');
    setPrefixText(''); setSuffixText(''); setHeadline(''); setDescription('');
    setButtonText(''); setSuccessMessage(''); setMessageTemplate('');
    setSourceWidgetId(''); setEndDate(''); setExpiredMessage('');
    setSocials({ facebook: true, twitter: true });
    setQuestionText(''); setThankYouMessage(''); setVideoUrl('');
    setCookieMessage(''); setCookieButtonText('');
    setEnableEmailNotifications(false); setNotificationEmail('');
    setEnableWebhookNotifications(false); setWebhookUrl('');
    setEnableSlackNotifications(false); setSlackWebhookUrl('');
    setEnableDiscordNotifications(false); setDiscordWebhookUrl('');
    setEnableTelegramNotifications(false); setTelegramBotToken(''); setTelegramChatId('');
    setEnableTeamsNotifications(false); setTeamsWebhookUrl('');
    setBackgroundColor('#2c3e50');
    setTextColor('#ffffff');
    setFontFamily('Inter');
    setDisplayDelay(0);
    setDisplayDuration(0);
    setLogoUrl('');
  };

  const handleCreateWidget = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setActiveScript(null);
    try {
      let settings: any = {};
      // Kumpulkan pengaturan kustomisasi umum
      const commonCustomization = {
        backgroundColor,
        textColor,
        fontFamily,
        displayDelay,
        displayDuration,
        logoUrl,
      };
      switch (widgetType) {
        case 'informational':
          settings = { text: infoText,title:headingText, ...commonCustomization }; break;
        case 'coupon': settings = {title:headingText,description: offerText, couponCode,image:logoUrl,buttonText,position,backgroundColor,textColor,buttonColor:buttonTextColor }; break;
        case 'live_counter': settings = { prefixText, suffixText }; break;
        case 'email_collector': 
          settings = { 
            headline, description, buttonText, successMessage,
            notifications: {
              email: { enabled: enableEmailNotifications, to: notificationEmail },
              webhook: { enabled: enableWebhookNotifications, url: webhookUrl },
              slack: { enabled: enableSlackNotifications, url: slackWebhookUrl },
              discord: { enabled: enableDiscordNotifications, url: discordWebhookUrl },
              telegram: { enabled: enableTelegramNotifications, botToken: telegramBotToken, chatId: telegramChatId },
              teams: { enabled: enableTeamsNotifications, url: teamsWebhookUrl }
            }
          }; 
          break;
        case 'recent_conversions': settings = { messageTemplate, sourceWidgetId }; break;
        case 'conversion_counter': settings = { messageTemplate, sourceWidgetId }; break;
        case 'countdown_timer': settings = { endDate, messageTemplate, expiredMessage }; break;
        case 'reviews': settings = {}; break;
        case 'social_share': settings = { socials }; break;
        case 'feedback': settings = { questionText, thankYouMessage }; break;
        case 'video': settings = { videoUrl }; break;
        case 'cookie_notification': settings = { cookieMessage, cookieButtonText }; break;
        default: throw new Error('Invalid widget type');
      }
      
      const payload = { name: widgetName, type: widgetType, settings };
      const response = await apiClient.post(`/workspaces/${workspaceId}/widgets`, payload);
      
      setIsModalOpen(false); // Tutup modal
      resetAllForms();      // Reset form
      await fetchWidgets(); // Muat ulang daftar widget

      if (response.data.type === 'reviews') {
        navigate(`/app/widget/${response.data.id}/reviews`);
      } else {
        handleGetCode(response.data.id);
      }
    } catch (err) {
      setError('Failed to create widget.');
    }
  };

  const handleGetCode = (widgetId: string) => {
    const scriptCode = `<script src="${import.meta.env.VITE_BACKEND_URL}/widget-loader.js" data-widget-id="${widgetId}" async defer></script>`;
    if (activeScript && activeScript.id === widgetId) {
      setActiveScript(null);
    } else {
      setActiveScript({ id: widgetId, code: scriptCode });
    }
  };

  const handleCopyCode = (codeToCopy: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      // Coba metode modern terlebih dahulu
      navigator.clipboard.writeText(codeToCopy)
        .then(() => toast.success('Code copied to clipboard!'))
        .catch(err => {
          console.warn('Modern copy failed, falling back:', err);
          fallbackCopyTextToClipboard(codeToCopy); // Gunakan fallback jika gagal
        });
    } else {
      // Langsung gunakan fallback jika API modern tidak tersedia
      fallbackCopyTextToClipboard(codeToCopy);
    }
  };

  // Metode fallback klasik
  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; // Jauhkan dari layar
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        toast.success('Code copied to clipboard!');
      } else {
        toast.error('Could not copy the code.');
      }
    } catch (err) {
      console.error('Fallback copy failed', err);
      toast.error('Could not copy the code.');
    }
    document.body.removeChild(textArea);
  };
  // ----------------------------------------------------

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <div>
                <Link to="/app/dashboard" className="text-sm text-brand-primary hover:underline mb-2 inline-block">&larr; Back to Dashboard</Link>
                <h1 className="text-3xl font-bold">Widgets</h1>
            </div>
            <button onClick={onCreateWidget}   className="px-4 py-2 font-medium text-white bg-brand-primary rounded-md hover:opacity-90">+ Create Widget</button>
        </div>

        {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
                <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <h2 className="text-xl font-semibold mb-6">Create New Widget</h2>
                    <form onSubmit={handleCreateWidget} className="space-y-4">
                        {/* Widget Type Selector */}
                        <div>
                            <label htmlFor="widgetType" className="block text-sm font-medium">Widget Type</label>
                            <select id="widgetType" value={widgetType} onChange={e => setWidgetType(e.target.value)} className="w-full mt-1 border-gray-300 rounded-md shadow-sm">
                                <option value="informational">Informational Message</option>
                                <option value="coupon">Coupon</option>
                                <option value="live_counter">Live Visitor Counter</option>
                                <option value="email_collector">Email Collector</option>
                                <option value="recent_conversions">Recent Conversions</option>
                                <option value="conversion_counter">Conversion Counter</option>
                                <option value="countdown_timer">Countdown Timer</option>
                                <option value="reviews">Reviews & Testimonials</option>
                                <option value="social_share">Social Share</option>
                                <option value="feedback">Feedback</option>
                                <option value="video">Video</option>
                                <option value="cookie_notification">Cookie Notification</option>
                            </select>
                        </div>
                        
                        {/* Widget Name */}
                        <div>
                            <label htmlFor="widgetName" className="block text-sm font-medium">Widget Name</label>
                            <input id="widgetName" type="text" value={widgetName} onChange={e => setWidgetName(e.target.value)} required className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/>
                        </div>
                        
                        {/* Conditional Forms based on widgetType */}

                        {widgetType === 'informational' && (
                            <div className="space-y-4 border-t pt-4 mt-4">
                                <div>
                                    <label htmlFor="headingText" className="block text-sm font-medium">Heading Text</label>
                                    <input id="headingText" type="text" value={headingText} onChange={e => setHeadingText(e.target.value)} required className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/>
                                </div>

                                <div>
                                    <label htmlFor="infoText" className="block text-sm font-medium">Message Text</label>
                                    <input id="infoText" type="text" value={infoText} onChange={e => setInfoText(e.target.value)} required className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/>
                                </div>
                                
                                <h3 className="text-lg font-semibold text-gray-700 pt-2 border-t">Appearance</h3>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label htmlFor="backgroundColor">Background Color</label><input id="backgroundColor" type="color" value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} className="w-full h-10 mt-1 border-gray-300 rounded-md"/></div>
                                    <div><label htmlFor="textColor">Text Color</label><input id="textColor" type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-full h-10 mt-1 border-gray-300 rounded-md"/></div>
                                </div>

                                <div>
                                    <label htmlFor="fontFamily" className="block text-sm font-medium">Font</label>
                                    <select id="fontFamily" value={fontFamily} onChange={e => setFontFamily(e.target.value)} className="w-full mt-1 border-gray-300 rounded-md shadow-sm">
                                        {availableFonts.map(font => <option key={font} value={font}>{font}</option>)}
                                    </select>
                                </div>
                                
                                <h3 className="text-lg font-semibold text-gray-700 pt-2 border-t">Timing</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div><label htmlFor="displayDelay" className="block text-sm font-medium">Display delay (seconds)</label><input id="displayDelay" type="number" min="0" value={displayDelay} onChange={e => setDisplayDelay(parseInt(e.target.value))} className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/></div>
                                    <div><label htmlFor="displayDuration" className="block text-sm font-medium">Display duration (seconds)</label><input id="displayDuration" type="number" min="0" value={displayDuration} onChange={e => setDisplayDuration(parseInt(e.target.value))} className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/><p className="text-xs text-gray-500">Set to 0 to show permanently.</p></div>
                                </div>
                                
                                <h3 className="text-lg font-semibold text-gray-700 pt-2 border-t">Branding</h3>

                                <div>
                                    <label htmlFor="logoUrl" className="block text-sm font-medium">Logo URL (Optional)</label>
                                    <input id="logoUrl" type="url" placeholder="https://your-site.com/logo.png" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/>
                                </div>
                            </div>
                        )}
                        
                        {widgetType === 'coupon' && (
                            <div className="space-y-4 border-t pt-4 mt-4">
                                <div>
                                    <label htmlFor="headingText" className="block text-sm font-medium">Heading Text</label>
                                    <input id="headingText" type="text" value={headingText} onChange={e => setHeadingText(e.target.value)} required className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/>
                                </div>

                                <div><label htmlFor="offerText">Offer Text</label><input id="offerText" type="text" value={offerText} onChange={e => setOfferText(e.target.value)} required /></div>
                                <div><label htmlFor="couponCode">Coupon Code</label><input id="couponCode" type="text" value={couponCode} onChange={e => setCouponCode(e.target.value)} required /></div>
                                <h3 className="text-lg font-semibold text-gray-700 pt-2">Appearance</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label htmlFor="backgroundColor">Background Color</label><input id="backgroundColor" type="color" value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} /></div>
                                    <div><label htmlFor="textColor">Text Color</label><input id="textColor" type="color" value={textColor} onChange={e => setTextColor(e.target.value)} /></div>
                                        <div><label htmlFor="textColor">Button Text Color</label><input id="textColor" type="color" value={buttonTextColor} onChange={e => setButtonTextColor(e.target.value)} /></div>
                                </div>
                                 <div>
                                    <label htmlFor="headingText" className="block text-sm font-medium">Button Text</label>
                                    <input id="headingText" type="text" value={buttonText} onChange={e => setButtonText(e.target.value)} required className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-700 pt-2">Position</h3>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                                      Select Position
                                    </label>
                                    <select
                                      id="position"
                                      value={position}
                                      onChange={(e) => setPosition(e.target.value)}
                                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    >
                                      {positions.map((pos) => (
                                        <option key={pos} value={pos}>
                                          {pos}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>


                               <div>
                                    <label htmlFor="logoUrl" className="block text-sm font-medium">Image URL (Optional)</label>
                                    <input id="logoUrl" type="url" placeholder="https://your-site.com/logo.png" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/>
                                </div>
                            </div>
                        )}
                        {widgetType === 'live_counter' && (
                            <>
                                <div><label htmlFor="prefixText" className="block text-sm font-medium">Prefix Text</label><input id="prefixText" type="text" placeholder="e.g., 🔥" value={prefixText} onChange={e => setPrefixText(e.target.value)} className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/></div>
                                <div><label htmlFor="suffixText" className="block text-sm font-medium">Suffix Text</label><input id="suffixText" type="text" placeholder="e.g., people are viewing this!" value={suffixText} onChange={e => setSuffixText(e.target.value)} className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/></div>
                            </>
                        )}
                        
                        {widgetType === 'email_collector' && (
                            <div className="space-y-4 border-t pt-4 mt-4">
                                <h3 className="text-lg font-semibold text-gray-700">Form Settings</h3>
                                <div><label htmlFor="headline" className="block text-sm font-medium">Headline</label><input id="headline" type="text" placeholder="e.g., Join our Newsletter!" value={headline} onChange={e => setHeadline(e.target.value)} required className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/></div>
                                <div><label htmlFor="description" className="block text-sm font-medium">Description</label><input id="description" type="text" placeholder="e.g., Get weekly updates." value={description} onChange={e => setDescription(e.target.value)} className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/></div>
                                <div><label htmlFor="buttonText" className="block text-sm font-medium">Button Text</label><input id="buttonText" type="text" placeholder="e.g., Subscribe" value={buttonText} onChange={e => setButtonText(e.target.value)} required className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/></div>
                                <div><label htmlFor="successMessage" className="block text-sm font-medium">Success Message</label><input id="successMessage" type="text" placeholder="e.g., Thanks for subscribing!" value={successMessage} onChange={e => setSuccessMessage(e.target.value)} required className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/></div>

                                <div className="border-t pt-4 mt-4 space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-700">Notifications</h3>
                                    
                                    {/* Email Notifications */}
                                    <div>
                                        <div className="flex items-start"><div className="flex items-center h-5"><input id="enableEmail" type="checkbox" checked={enableEmailNotifications} onChange={e => setEnableEmailNotifications(e.target.checked)} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"/></div><div className="ml-3 text-sm"><label htmlFor="enableEmail" className="font-medium text-gray-700">Enable Email Notifications</label><p className="text-gray-500">Get an email for each new lead.</p></div></div>
                                        {enableEmailNotifications && (<div className="mt-2 pl-8"><label htmlFor="notificationEmail" className="block text-sm font-medium">Send to Email</label><input id="notificationEmail" type="email" value={notificationEmail} onChange={e => setNotificationEmail(e.target.value)} required placeholder="your-email@example.com" className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/></div>)}
                                    </div>

                                    {/* Webhook Notifications */}
                                    <div>
                                        <div className="flex items-start"><div className="flex items-center h-5"><input id="enableWebhook" type="checkbox" checked={enableWebhookNotifications} onChange={e => setEnableWebhookNotifications(e.target.checked)} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"/></div><div className="ml-3 text-sm"><label htmlFor="enableWebhook" className="font-medium text-gray-700">Enable Webhook Notifications</label></div></div>
                                        {enableWebhookNotifications && (<div className="pl-8 mt-2"><label htmlFor="webhookUrl" className="block text-sm font-medium">Webhook URL</label><input id="webhookUrl" type="url" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} required placeholder="https://your-service.com/webhook" className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/></div>)}
                                    </div>

                                    {/* Slack Notifications */}
                                    <div>
                                        <div className="flex items-start"><div className="flex items-center h-5"><input id="enableSlack" type="checkbox" checked={enableSlackNotifications} onChange={e => setEnableSlackNotifications(e.target.checked)} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"/></div><div className="ml-3 text-sm"><label htmlFor="enableSlack" className="font-medium text-gray-700">Enable Slack Notifications</label></div></div>
                                        {enableSlackNotifications && (<div className="pl-8 mt-2"><label htmlFor="slackWebhookUrl" className="block text-sm font-medium">Slack Webhook URL</label><input id="slackWebhookUrl" type="url" value={slackWebhookUrl} onChange={e => setSlackWebhookUrl(e.target.value)} required placeholder="https://hooks.slack.com/services/..." className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/></div>)}
                                    </div>
                                    
                                    {/* Discord Notifications */}
                                    <div>
                                        <div className="flex items-start"><div className="flex items-center h-5"><input id="enableDiscord" type="checkbox" checked={enableDiscordNotifications} onChange={e => setEnableDiscordNotifications(e.target.checked)} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"/></div><div className="ml-3 text-sm"><label htmlFor="enableDiscord" className="font-medium text-gray-700">Enable Discord Notifications</label></div></div>
                                        {enableDiscordNotifications && (<div className="pl-8 mt-2"><label htmlFor="discordWebhookUrl" className="block text-sm font-medium">Discord Webhook URL</label><input id="discordWebhookUrl" type="url" value={discordWebhookUrl} onChange={e => setDiscordWebhookUrl(e.target.value)} required placeholder="https://discord.com/api/webhooks/..." className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/></div>)}
                                    </div>
                                    
                                    {/* Telegram Notifications */}
                                    <div>
                                        <div className="flex items-start"><div className="flex items-center h-5"><input id="enableTelegram" type="checkbox" checked={enableTelegramNotifications} onChange={e => setEnableTelegramNotifications(e.target.checked)} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"/></div><div className="ml-3 text-sm"><label htmlFor="enableTelegram" className="font-medium text-gray-700">Enable Telegram Notifications</label></div></div>
                                        {enableTelegramNotifications && (<div className="pl-8 mt-2 space-y-2"><div><label htmlFor="telegramBotToken" className="block text-sm font-medium">Telegram Bot API Token</label><input id="telegramBotToken" type="text" value={telegramBotToken} onChange={e => setTelegramBotToken(e.target.value)} required placeholder="123456:ABC-DEF1234..." className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/></div><div><label htmlFor="telegramChatId" className="block text-sm font-medium">Telegram Chat ID</label><input id="telegramChatId" type="text" value={telegramChatId} onChange={e => setTelegramChatId(e.target.value)} required placeholder="-1001234567..." className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/></div></div>)}
                                    </div>

                                    {/* Microsoft Teams Notifications */}
                                    <div>
                                        <div className="flex items-start"><div className="flex items-center h-5"><input id="enableTeams" type="checkbox" checked={enableTeamsNotifications} onChange={e => setEnableTeamsNotifications(e.target.checked)} className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"/></div><div className="ml-3 text-sm"><label htmlFor="enableTeams" className="font-medium text-gray-700">Enable Microsoft Teams Notifications</label></div></div>
                                        {enableTeamsNotifications && (<div className="pl-8 mt-2"><label htmlFor="teamsWebhookUrl" className="block text-sm font-medium">Teams Webhook URL</label><input id="teamsWebhookUrl" type="url" value={teamsWebhookUrl} onChange={e => setTeamsWebhookUrl(e.target.value)} required placeholder="https://your-tenant.webhook.office.com/..." className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/></div>)}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {widgetType === 'recent_conversions' || widgetType === 'conversion_counter' ? (
                            <>
                                <div><label htmlFor="messageTemplate" className="block text-sm font-medium">Message Template</label><input id="messageTemplate" type="text" placeholder={widgetType === 'recent_conversions' ? "e.g., [email] just signed up!" : "e.g., [count] people have signed up!"} value={messageTemplate} onChange={e => setMessageTemplate(e.target.value)} required className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/></div>
                                <div><label htmlFor="sourceWidgetId" className="block text-sm font-medium">Data Source</label><select id="sourceWidgetId" value={sourceWidgetId} onChange={e => setSourceWidgetId(e.target.value)} required className="w-full mt-1 border-gray-300 rounded-md shadow-sm"><option value="" disabled>Select an Email Collector widget</option>{emailCollectorWidgets.length > 0 ? (emailCollectorWidgets.map(w => (<option key={w.id} value={w.id}>{w.name}</option>))) : (<option value="" disabled>No Email Collector widgets found</option>)}</select></div>
                            </>
                        ) : null}

                        {widgetType === 'countdown_timer' && (
                            <>
                                <div><label htmlFor="endDate" className="block text-sm font-medium">End Date and Time</label><input id="endDate" type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} required className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/></div>
                                <div><label htmlFor="messageTemplate" className="block text-sm font-medium">Countdown Message</label><input id="messageTemplate" type="text" placeholder="e.g., Offer ends in [timer]" value={messageTemplate} onChange={e => setMessageTemplate(e.target.value)} required className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/></div>
                                <div><label htmlFor="expiredMessage" className="block text-sm font-medium">Expiration Message</label><input id="expiredMessage" type="text" placeholder="e.g., This offer has expired." value={expiredMessage} onChange={e => setExpiredMessage(e.target.value)} required className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/></div>
                            </>
                        )}
                        
                        {widgetType === 'reviews' && (<p className="text-sm text-gray-600 bg-gray-100 p-3 rounded-md">Configuration and review management will be available on the next page after creation.</p>)}

                        {widgetType === 'social_share' && (
                            <div>
                                <label className="block text-sm font-medium">Select Platforms</label>
                                <div className="mt-2 grid grid-cols-2 gap-4">
                                    {availableSocials.map(platform => (
                                        <label key={platform} className="flex items-center space-x-3">
                                            <input type="checkbox" checked={!!socials[platform]} onChange={() => handleSocialChange(platform)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded"/>
                                            <span className="text-gray-700 capitalize">{platform === 'twitter' ? 'Twitter (X)' : platform}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {widgetType === 'feedback' && (
                            <>
                                <div><label htmlFor="questionText" className="block text-sm font-medium">Question Text</label><input id="questionText" type="text" placeholder="e.g., How was your experience?" value={questionText} onChange={e => setQuestionText(e.target.value)} required className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/></div>
                                <div><label htmlFor="thankYouMessage" className="block text-sm font-medium">Thank You Message</label><input id="thankYouMessage" type="text" placeholder="e.g., Thanks for your feedback!" value={thankYouMessage} onChange={e => setThankYouMessage(e.target.value)} required className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/></div>
                            </>
                        )}

                        {widgetType === 'video' && (
                            <div>
                                <label htmlFor="videoUrl" className="block text-sm font-medium">Video URL</label>
                                <input id="videoUrl" type="url" placeholder="e.g., https://www.youtube.com/watch?v=..." value={videoUrl} onChange={e => setVideoUrl(e.target.value)} required className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/>
                            </div>
                        )}
                        
                        {widgetType === 'cookie_notification' && (
                            <>
                                <div><label htmlFor="cookieMessage" className="block text-sm font-medium">Message Text</label><input id="cookieMessage" type="text" placeholder="e.g., This website uses cookies..." value={cookieMessage} onChange={e => setCookieMessage(e.target.value)} required className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/></div>
                                <div><label htmlFor="cookieButtonText" className="block text-sm font-medium">Button Text</label><input id="cookieButtonText" type="text" placeholder="e.g., Got it!" value={cookieButtonText} onChange={e => setCookieButtonText(e.target.value)} required className="w-full mt-1 border-gray-300 rounded-md shadow-sm"/></div>
                            </>
                        )}

                        <div className="flex justify-end space-x-3 pt-6 border-t">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                            <button type="submit" className="px-4 py-2 font-medium text-white bg-brand-primary rounded-md hover:opacity-90">
                                {widgetType === 'reviews' ? 'Create & Manage' : 'Create & Get Code'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
      
      <div className="space-y-4">
        {widgets.length > 0 ? (
            widgets.map(w => (
              <div key={w.id} className="p-4 bg-white rounded-lg shadow">
                <div className="flex justify-between items-start">
                    <div><p className="font-semibold">{w.name} <span className="text-xs bg-gray-200 text-gray-700 font-mono p-1 rounded">{w.type}</span></p>{w.type === 'reviews' && (<Link to={`/app/widget/${w.id}/reviews`} className="text-sm text-brand-primary hover:underline">Manage Reviews</Link>)}</div>
                    <button onClick={() => handleGetCode(w.id)} className="px-3 py-1 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700">Get Code</button>
                </div>
                {activeScript && activeScript.id === w.id && (
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold">Embed this code:</h3>
                    <div className="relative">
                      <pre className="p-3 pr-16 mt-2 bg-gray-800 text-white rounded-md text-xs overflow-x-auto">
                        <code>{activeScript.code}</code>
                      </pre>
                      <button 
                        onClick={() => handleCopyCode(activeScript.code)}
                        className="absolute top-2 right-2 p-1.5 bg-gray-700 rounded-md text-gray-300 hover:bg-gray-600"
                        title="Copy to clipboard"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
        ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg"><h3 className="text-lg font-medium text-gray-900">No widgets yet</h3><p className="text-sm text-gray-500 mt-1">Get started by creating your first widget.</p><button onClick={() => setIsModalOpen(true)} className="mt-4 px-4 py-2 font-medium text-white bg-brand-primary rounded-md hover:opacity-90">+ Create Widget</button></div>
        )}
      </div>
    </div>
  );
}