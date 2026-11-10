import React, { useState, useEffect } from 'react';
import { alertAPI } from '../services/api';
import { AlertList } from '../components/AlertList';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { DemoDataBanner } from '../components/DemoDataBanner';
import { Bell, MessageSquare, Send, CheckCircle2, ShieldAlert, Zap, Radio } from 'lucide-react';

export default function SmartAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [testNumber, setTestNumber] = useState('+91 98765 43210');
  const [channel, setChannel] = useState('WHATSAPP');
  const [dispatchStatus, setDispatchStatus] = useState(null);

  const fetchAlerts = () => {
    alertAPI.getAll()
      .then((res) => {
        setIsDemo(Boolean(res.isDemo));
        const data = res.data?.data || res.data || [];
        setAlerts(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleGenerateAlerts = async () => {
    setGenerating(true);
    try {
      const res = await alertAPI.generate();
      const newAlerts = res.data?.data || res.data || [];
      if (Array.isArray(newAlerts) && newAlerts.length > 0) {
        setAlerts(newAlerts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handleSimulateDispatch = (e) => {
    e.preventDefault();
    setDispatchStatus('DISPATCHING');
    setTimeout(() => {
      setDispatchStatus('SUCCESS');
      setTimeout(() => setDispatchStatus(null), 4000);
    }, 1200);
  };

  if (loading) {
    return <LoadingSpinner message="Querying heat alert dispatch system..." />;
  }

  return (
    <div className="space-y-6">
      <DemoDataBanner isDemo={isDemo} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-800 gap-2">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <Bell className="w-6 h-6 text-orange-500" />
            <span>SMART ALERT & EARLY WARNING SYSTEM</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Dynamic threshold-triggered advisories and automated civil defense notifications for Pune municipal zones.
          </p>
        </div>

        <button
          onClick={handleGenerateAlerts}
          disabled={generating}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs shadow-lg shadow-orange-950/40 transition disabled:opacity-50"
        >
          <Zap className="w-4 h-4" />
          <span>{generating ? 'Evaluating Thresholds...' : 'Recalculate Dynamic Alerts'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Alerts Feed */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              <span>Active Early-Warning Advisories ({alerts.length})</span>
            </h2>
          </div>
          <AlertList alerts={alerts} />
        </div>

        {/* Right: SMS / WhatsApp Gateway Integration Sandbox */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-gray-800">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Emergency Broadcast Integration</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Platform architecture includes pre-configured webhook connectors for SMS (Twilio / CDAC Gov SMS Gateway) and WhatsApp Cloud API for municipal broadcast.
            </p>

            <form onSubmit={handleSimulateDispatch} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Dispatch Channel</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setChannel('WHATSAPP')}
                    className={`py-2 px-3 rounded-lg border font-semibold flex items-center justify-center space-x-1.5 transition ${
                      channel === 'WHATSAPP'
                        ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/50'
                        : 'bg-gray-800 border-gray-700 text-gray-400'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>WhatsApp Gateway</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('SMS')}
                    className={`py-2 px-3 rounded-lg border font-semibold flex items-center justify-center space-x-1.5 transition ${
                      channel === 'SMS'
                        ? 'bg-orange-600/20 text-orange-400 border-orange-500/50'
                        : 'bg-gray-800 border-gray-700 text-gray-400'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Gov SMS Cell</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Subscriber / Test Phone Number</label>
                <input
                  type="text"
                  value={testNumber}
                  onChange={(e) => setTestNumber(e.target.value)}
                  className="w-full bg-[#1a2332] border border-gray-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Message Payload Preview */}
              <div className="bg-[#0a0f1e] p-3 rounded-lg border border-gray-800 text-[11px] text-gray-300 font-mono space-y-1">
                <span className="text-gray-400 text-[10px] uppercase font-bold block mb-1">Payload Preview</span>
                <p className="text-orange-300 font-bold">[HEATGUARD PUNE ALERT - EXTREME]</p>
                <p>Severe heatwave advisory for Kasba & Bhavani Peth. Thermal Stress Score: 78/100. Drink ORS, stay indoors 11 AM-4 PM.</p>
              </div>

              <button
                type="submit"
                disabled={dispatchStatus === 'DISPATCHING'}
                className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{dispatchStatus === 'DISPATCHING' ? 'Transmitting Gateway...' : 'Send Simulated Broadcast Test'}</span>
              </button>

              {dispatchStatus === 'SUCCESS' && (
                <div className="p-3 bg-emerald-950/30 border border-emerald-500/40 rounded-lg flex items-center space-x-2 text-xs text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Dispatch webhook executed! Simulated delivery status: 200 OK.</span>
                </div>
              )}
            </form>
          </div>

          {/* Trigger Threshold Reference */}
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 shadow-xl text-xs space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Alert Threshold Rules</h4>
            <div className="flex justify-between py-1 border-b border-gray-800">
              <span className="text-red-400 font-semibold">Extreme Heat Emergency</span>
              <span className="font-mono text-gray-300">Thermal Stress &gt; 80 pts</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-800">
              <span className="text-rose-400 font-semibold">Severe Heat Warning</span>
              <span className="font-mono text-gray-300">Thermal Stress 65 - 80 pts</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-800">
              <span className="text-orange-400 font-semibold">Heat Advisory</span>
              <span className="font-mono text-gray-300">Thermal Stress 50 - 65 pts</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-amber-300 font-semibold">Heat Watch</span>
              <span className="font-mono text-gray-300">Thermal Stress 35 - 50 pts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
