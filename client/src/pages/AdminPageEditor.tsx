import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useAdmin } from '@/contexts/AdminContext';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, RefreshCcw, Layout, FileText, Settings } from 'lucide-react';

interface PageContent {
  heroTitle: string;
  heroSubtitle: string;
  aboutTitle: string;
  aboutContent: string;
  servicesTitle: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  [key: string]: string;
}

const DEFAULT_CONTENT: PageContent = {
  heroTitle: "Your Growth Team, Ready Now",
  heroSubtitle: "Scale your operations with dedicated global talent. We provide the expertise you need to grow without the complexity.",
  aboutTitle: "Global Outsourcing Solutions",
  aboutContent: "OutsourcEdge helps businesses scale by providing high-quality, dedicated remote teams. Our mission is to bridge the gap between global talent and growing enterprises.",
  servicesTitle: "Our Specialized Services",
  contactEmail: "info@outsourcedge.com",
  contactPhone: "+1 (555) 000-0000",
  address: "Global Operations"
};

export default function AdminPageEditor() {
  const { isAuthenticated } = useAdmin();
  const [content, setContent] = useState<PageContent>(DEFAULT_CONTENT);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!db || !isAuthenticated) return;

    const fetchContent = async () => {
      try {
        const docRef = doc(db, 'site_content', 'main');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setContent({ ...DEFAULT_CONTENT, ...docSnap.data() });
        } else {
          await setDoc(docRef, DEFAULT_CONTENT);
        }
      } catch (error) {
        console.error('Error fetching site content:', error);
        toast.error('Failed to load site content');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [isAuthenticated]);

  const handleSave = async () => {
    if (!db) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'site_content', 'main'), {
        ...content,
        updatedAt: serverTimestamp()
      });
      toast.success('Website content updated successfully!');
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (key: keyof PageContent, value: string) => {
    setContent(prev => ({ ...prev, [key]: value }));
  };

  if (!isAuthenticated) return null;

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Website Editor</h1>
          <p className="text-slate-500">Update your website's text and information in real-time</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-[#1B3A4B] hover:bg-[#1B3A4B]/90"
        >
          {isSaving ? <RefreshCcw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="homepage" className="space-y-6">
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="homepage" className="flex items-center gap-2">
            <Layout size={16} /> Homepage
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-2">
            <FileText size={16} /> About Page
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Settings size={16} /> Global Info
          </TabsTrigger>
        </TabsList>

        <TabsContent value="homepage" className="space-y-6 bg-white p-6 rounded-xl border border-slate-200">
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label>Hero Section Title</Label>
              <Input 
                value={content.heroTitle} 
                onChange={(e) => handleChange('heroTitle', e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label>Hero Section Subtitle</Label>
              <Textarea 
                value={content.heroSubtitle} 
                onChange={(e) => handleChange('heroSubtitle', e.target.value)} 
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Services Section Title</Label>
              <Input 
                value={content.servicesTitle} 
                onChange={(e) => handleChange('servicesTitle', e.target.value)} 
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="about" className="space-y-6 bg-white p-6 rounded-xl border border-slate-200">
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label>About Section Title</Label>
              <Input 
                value={content.aboutTitle} 
                onChange={(e) => handleChange('aboutTitle', e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label>About Main Content</Label>
              <Textarea 
                value={content.aboutContent} 
                onChange={(e) => handleChange('aboutContent', e.target.value)} 
                rows={6}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6 bg-white p-6 rounded-xl border border-slate-200">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Support Email</Label>
              <Input 
                value={content.contactEmail} 
                onChange={(e) => handleChange('contactEmail', e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input 
                value={content.contactPhone} 
                onChange={(e) => handleChange('contactPhone', e.target.value)} 
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Office Address</Label>
              <Input 
                value={content.address} 
                onChange={(e) => handleChange('address', e.target.value)} 
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
