import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Expand, Minus, Plus, Trash, ZoomOut, UploadCloud, Upload, HelpCircle } from 'lucide-react';

type EditAboutProps = {
    open: boolean;
    onClose: () => void;
    onSave?: (data: any) => void;
    center?: { x: number; y: number } | null;
};

export default function EditAbout({ open, onClose, onSave, center = null }: EditAboutProps) {
    if (!open) return null;

    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerUrl, setViewerUrl] = useState<string | null>(null);
    const [viewerZoom, setViewerZoom] = useState(1);
    const [viewerRotate, setViewerRotate] = useState(0);

    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // editable fields (pre-populated with same mock values as About)
    const [name, setName] = useState('GWYNETH UY');
    const [contact, setContact] = useState('0905 385 4293');
    const [address, setAddress] = useState('Block 1, Lot 17, Paraiso Rd, 1400');
    const [coordinates, setCoordinates] = useState('14.774083, 121.042443');
    const [altFocal, setAltFocal] = useState('Rodel Sustiguer');

    function openViewer(url: string) {
        setViewerUrl(url);
        setViewerZoom(1);
        setViewerRotate(0);
        setViewerOpen(true);
    }

    function closeViewer() {
        setViewerOpen(false);
        setViewerUrl(null);
    }

    function toggleZoom() {
        setViewerZoom((z) => (z === 1 ? 1.5 : 1));
    }

    function rotateOnce() {
        setViewerRotate((r) => (r + 90) % 360);
    }

    function downloadImage() {
        if (!viewerUrl) return;
        const a = document.createElement('a');
        a.href = viewerUrl;
        a.download = 'image.jpg';
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    const baseStyle: any = {
        width: 'min(780px, 92%)',
        maxHeight: 'calc(85vh)',
        minHeight: 80,
        overflow: 'auto',
        background: '#0d0d0d',
        color: '#fff',
        borderRadius: 7,
        padding: '62px 75px',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
    };

    const modalStyle: any = center
        ? { ...baseStyle, position: 'fixed', left: center.x, top: center.y, transform: 'translate(-50%, -50%)', background: '#171717' }
        : { ...baseStyle, position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#171717' };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 'var(--z-popover)' }}>
            <div style={modalStyle}>
                <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', right: 35, top: 30, background: 'transparent', border: 'none', color: '#BABABA', fontSize: 18, cursor: 'pointer' }}>✕</button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: 27, fontWeight: 800, letterSpacing: 0.6 }}>EDIT COMMUNITY</h2>
                        <div style={{ marginTop: 6, color: '#fff', fontSize: 13, fontWeight: 300 }}>Registered At: September 10, 2025 <span style={{ fontWeight: 200, opacity: 0.5 }}> &nbsp; | &nbsp; </span> Last Updated At: September 11, 2025</div>
                    </div>
                </div>

                <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>

                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 14, fontWeight: 400, marginTop: 15 }}>Community Group Name</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ flex: 1, marginTop: 2 }}>
                                <Input value={"Sicat Residence"} style={{ padding: '22px 17px', border: '1px solid #404040', borderRadius: 6, background: 'transparent', color: '#fff', fontSize: 14 }} onChange={(e: any) => setName(e.target.value)} className="bg-input/10 text-white" />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <div style={{ flex: 1, marginTop: 2 }}>
                                <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 14, fontWeight: 400, marginTop: 15 }}>Total No. of Individuals</div>
                                <Input value={50} style={{ padding: '21px 17px', border: '1px solid #404040', borderRadius: 6, background: 'transparent', color: '#fff', fontSize: 14 }} onChange={(e: any) => setName(e.target.value)} className="bg-input/10 text-white" />
                            </div>
                            <div style={{ flex: 1, marginTop: 2 }}>
                                <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 14, fontWeight: 400, marginTop: 15 }}>Total No. of Families</div>
                                <Input value={10} style={{ padding: '21px 17px', border: '1px solid #404040', borderRadius: 6, background: 'transparent', color: '#fff', fontSize: 14 }} onChange={(e: any) => setName(e.target.value)} className="bg-input/10 text-white" />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <div style={{ flex: 1, marginTop: 2 }}>
                                <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 14, fontWeight: 400, marginTop: 15 }}>Total No. of Babies</div>
                                <Input value={5} style={{ padding: '21px 17px', border: '1px solid #404040', borderRadius: 6, background: 'transparent', color: '#fff', fontSize: 14 }} onChange={(e: any) => setName(e.target.value)} className="bg-input/10 text-white" />
                            </div>
                            <div style={{ flex: 1, marginTop: 2 }}>
                                <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 14, fontWeight: 400, marginTop: 15 }}>Total No. of Senior Citizen</div>
                                <Input value={8} style={{ padding: '21px 17px', border: '1px solid #404040', borderRadius: 6, background: 'transparent', color: '#fff', fontSize: 14 }} onChange={(e: any) => setName(e.target.value)} className="bg-input/10 text-white" />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <div style={{ flex: 1, marginTop: 2 }}>
                                <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 14, fontWeight: 400, marginTop: 15 }}>Total No. of Pregnant Women</div>
                                <Input value={10} style={{ padding: '21px 17px', border: '1px solid #404040', borderRadius: 6, background: 'transparent', color: '#fff', fontSize: 14 }} onChange={(e: any) => setName(e.target.value)} className="bg-input/10 text-white" />
                            </div>
                            <div style={{ flex: 1, marginTop: 2 }}>
                                <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 14, fontWeight: 400, marginTop: 15 }}>Total no. of PWDs</div>
                                <Input value={5} style={{ padding: '21px 17px', border: '1px solid #404040', borderRadius: 6, background: 'transparent', color: '#fff', fontSize: 14 }} onChange={(e: any) => setName(e.target.value)} className="bg-input/10 text-white" />
                            </div>
                        </div>

                        <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 14, fontWeight: 400, marginTop: 15 }}>Other notable information</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ flex: 1, marginTop: 2 }}>
                                <Input value={"Prone to landslide and tree falling"} style={{ padding: '22px 17px', border: '1px solid #404040', borderRadius: 6, background: 'transparent', color: '#fff', fontSize: 14 }} onChange={(e: any) => setName(e.target.value)} className="bg-input/10 text-white" />
                            </div>
                        </div>

                    </div>
                    <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 15, fontWeight: 600, marginTop: 15 }}>Focal Person’s Information</div>


                    <div style={{ background: '#0b0b0b', borderRadius: 6, display: 'flex', justifyContent: 'center' }}>
                        <div style={{ width: '100%', maxWidth: '100%', height: 240, borderRadius: 8, overflow: 'hidden', position: 'relative', backgroundColor: '#111' }}>
                            <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(https://avatars.githubusercontent.com/u/1?v=4)`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', filter: 'blur(18px) brightness(0.55)', transform: 'scale(1.2)' }} />
                            <img src="https://avatars.githubusercontent.com/u/1?v=4" alt="Focal" style={{ position: 'relative', width: 'auto', height: '100%', maxWidth: '60%', margin: '0 auto', objectFit: 'contain', display: 'block' }} />
                            <button
                                aria-label="Delete"
                                onClick={() => {/* handle delete logic here */ }}
                                style={{ position: 'absolute', right: 15, bottom: 15, width: 36, height: 36, borderRadius: 1, background: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
                                <Trash size={15} color="red" strokeWidth={3} />
                            </button>
                        </div>
                    </div>


                </div>

                <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 14, fontWeight: 400, marginTop: 30 }}>Name</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1, marginTop: 2 }}>
                        <Input value={"Gwyneth Uy"} style={{ padding: '22px 17px', border: '1px solid #404040', borderRadius: 6, background: 'transparent', color: '#fff', fontSize: 14 }} onChange={(e: any) => setName(e.target.value)} className="bg-input/10 text-white" />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ flex: 1, marginTop: 2 }}>
                        <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 14, fontWeight: 400, marginTop: 17 }}>Contact Number</div>
                        <Input value={"09297645276"} style={{ padding: '21px 17px', border: '1px solid #404040', borderRadius: 6, background: 'transparent', color: '#fff', fontSize: 14 }} onChange={(e: any) => setName(e.target.value)} className="bg-input/10 text-white" />
                    </div>
                    <div style={{ flex: 1, marginTop: 2 }}>
                        <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 14, fontWeight: 400, marginTop: 17 }}>Email</div>
                        <Input value={"uy.gwynethfabul@gmail.com"} style={{ padding: '21px 17px', border: '1px solid #404040', borderRadius: 6, background: 'transparent', color: '#fff', fontSize: 14 }} onChange={(e: any) => setName(e.target.value)} className="bg-input/10 text-white" />
                    </div>
                </div>

                <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 14, fontWeight: 400, marginTop: 16 }}>Address</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, marginTop: 2, position: 'relative' }}>
                        <Input value={address} style={{ padding: '22px 46px 22px 17px', border: '1px solid #404040', borderRadius: 6, background: '#262626', color: '#BABABA', fontSize: 14 }} onChange={(e: any) => setAddress(e.target.value)} className="bg-input/10 text-white" />
                        <div title="Help: format should be 'Street, Barangay, City, Zip'" onClick={() => {/* optional help action */ }} 
                        style={{ position: 'absolute', right: 15, top: '50%', transform: 'translateY(-50%)', width: 21, height: 21, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', cursor: 'pointer' }}>
                            <HelpCircle color="#9CA3AF" />
                        </div>
                    </div>
                </div>

                <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 14, fontWeight: 400, marginTop: 16 }}>Coordinates</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1, marginTop: 2 }}>
                        <Input value={"14.774083, 121.042443"} style={{ padding: '22px 17px', border: '1px solid #404040', borderRadius: 6, background: '#262626', color: '#BABABA', fontSize: 14 }} onChange={(e: any) => setName(e.target.value)} className="bg-input/10 text-white" />
                    </div>
                </div>

                <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 15, fontWeight: 600, marginTop: 35 }}>Alternative Focal Person’s Information</div>

                <div style={{ marginTop: 8 }}>
                    <div onClick={() => fileInputRef.current?.click()} role="button" tabIndex={0} onKeyDown={() => fileInputRef.current?.click()} style={{ cursor: 'pointer', background: '#262626', padding: '28px', borderRadius: 8, border: '1px dashed #404040', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                        <div style={{ background: '#1f2937', width: 48, height: 48, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Upload color="#60A5FA" />
                        </div>
                        <div style={{ color: '#fff', fontWeight: 700 }}>Upload photo</div>
                        <div style={{ color: '#9ca3af', fontSize: 12 }}>Drag and drop or click to upload</div>
                        <div style={{ color: '#9ca3af', fontSize: 12 }}>JPG and PNG, file size no more than 10MB</div>
                        {photoUrl ? <img src={photoUrl} alt="preview" style={{ marginTop: 12, maxWidth: 160, borderRadius: 6 }} /> : null}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" style={{ display: 'none' }} onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        try {
                            const url = URL.createObjectURL(f);
                            setPhotoUrl(url);
                        } catch (err) { }
                    }} />
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                    <div style={{ flex: 1, marginTop: 2 }}>
                        <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 14, fontWeight: 400, marginTop: 17 }}>Name</div>
                        <Input value={"Franxine Diaz"} style={{ padding: '21px 17px', border: '1px solid #404040', borderRadius: 6, background: 'transparent', color: '#fff', fontSize: 14 }} onChange={(e: any) => setName(e.target.value)} className="bg-input/10 text-white" />
                    </div>
                    <div style={{ flex: 1, marginTop: 2 }}>
                        <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 14, fontWeight: 400, marginTop: 17 }}>Contact Number</div>
                        <Input value={"09297645276"} style={{ padding: '21px 17px', border: '1px solid #404040', borderRadius: 6, background: 'transparent', color: '#fff', fontSize: 14 }} onChange={(e: any) => setName(e.target.value)} className="bg-input/10 text-white" />
                    </div>
                </div>

                <div style={{ marginTop: 30, display: 'flex', gap: 12, width: '100%' }}>
                    <button
                        onClick={() => { onSave?.({ name, contact, address, coordinates, altFocal }); onClose(); }}
                        className="w-full bg-gradient-to-t from-[#3B82F6] to-[#70A6FF] transition-colors duration-150 cursor-pointer hover:from-[#2563eb] hover:to-[#60a5fa] text-white py-3 px-4.5 rounded-md font-medium text-[15px] tracking-[0.6px] border-0"
                        style={{ width: '100%' }}
                    >
                        SAVE CHANGES
                    </button>
                </div>
            </div>

        </div>
    );
}
