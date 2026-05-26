import { useEffect, useState } from 'react';
import { Loader2, Save, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { appSettingsService, type AppSettings } from '@/services/appSettingsService';
import { toast } from 'sonner';

const DEFAULT_SETTINGS: AppSettings = {
  currency: 'USD',
  taxRate: 0,
  paymentsEnabled: true,
  codEnabled: true,
  maintenanceMode: false,
};

export function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const response = await appSettingsService.getSettings();
        if (response.success && response.data) {
          setSettings(response.data);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        toast.error('Failed to load system settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await appSettingsService.updateSettings(settings);
      if (response.success && response.data) {
        setSettings(response.data);
        toast.success('System settings updated');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to update system settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">System Settings</h1>
        <p className="text-gray-600">Manage global platform configuration used across storefront and dashboards.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-orange-500" />
            Platform Controls
          </CardTitle>
          <CardDescription>
            Changes are persisted immediately and used by all connected clients.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={settings.currency}
                onChange={(e) => setSettings((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }))}
                maxLength={10}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={settings.taxRate}
                onChange={(e) => setSettings((prev) => ({ ...prev, taxRate: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center gap-3 rounded-lg border p-4">
              <input
                type="checkbox"
                checked={settings.paymentsEnabled}
                onChange={(e) => setSettings((prev) => ({ ...prev, paymentsEnabled: e.target.checked }))}
              />
              <span className="text-sm font-medium">Payments Enabled</span>
            </label>
            <label className="flex items-center gap-3 rounded-lg border p-4">
              <input
                type="checkbox"
                checked={settings.codEnabled}
                onChange={(e) => setSettings((prev) => ({ ...prev, codEnabled: e.target.checked }))}
              />
              <span className="text-sm font-medium">Cash on Delivery</span>
            </label>
            <label className="flex items-center gap-3 rounded-lg border p-4">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings((prev) => ({ ...prev, maintenanceMode: e.target.checked }))}
              />
              <span className="text-sm font-medium">Maintenance Mode</span>
            </label>
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
