import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Input } from '@/components/ui/input';
import { Trash, Upload, HelpCircle } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
} from '@/components/ui/alert-dialog-focal';
import useCommunityData from '../hooks/useCommunityData';

type EditAboutProps = {
    open: boolean;
    onClose: () => void;
    onSave?: (data: any) => void;
    center?: { x: number; y: number } | null;
};
export type EditAboutHandle = {
    openDiscardConfirm: (onContinue?: () => void) => void;
}

const EditAbout = forwardRef<EditAboutHandle, EditAboutProps>(({ open, onClose, onSave, center = null }, ref) => {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    // expose imperative method to parent with optional continue callback
    const pendingContinueRef = useRef<(() => void) | null>(null);
    useImperativeHandle(ref, () => ({
        openDiscardConfirm: (onContinue?: () => void) => {
            pendingContinueRef.current = onContinue ?? null;
            setConfirmOpen(true);
        },
    }));
    // community data hook (shared mock store)
    const { data, setData } = useCommunityData();

    // editable fields (will be initialized from the shared hook when opened)
    const [groupName, setGroupName] = useState('');
    const [individuals, setIndividuals] = useState<number>(0);
    const [families, setFamilies] = useState<number>(0);
    const [kids, setKids] = useState<number>(0);
    const [seniors, setSeniors] = useState<number>(0);
    const [pregnant, setPregnant] = useState<number>(0);
    const [pwds, setPwds] = useState<number>(0);
    const [otherInfo, setOtherInfo] = useState('');

    // focal person
    const [focalName, setFocalName] = useState('');
    const [focalContact, setFocalContact] = useState('');
    const [focalEmail, setFocalEmail] = useState('');
    const [focalAddress, setFocalAddress] = useState('');
    const [focalCoordinates, setFocalCoordinates] = useState('');
    const [altFocalName, setAltFocalName] = useState('');

    // initialize local state from shared data when modal opens
    useEffect(() => {
        if (!open) return;
        if (!data) return;
        setGroupName(data.groupName ?? '');
        setIndividuals(data.stats?.individuals ?? 0);
        setFamilies(data.stats?.families ?? 0);
        setKids(data.stats?.kids ?? 0);
        setSeniors(data.stats?.seniors ?? 0);
        setPregnant(data.stats?.pregnant ?? 0);
        setPwds(data.stats?.pwds ?? 0);
        setOtherInfo(data.note ?? '');

        setFocalName(data.focal?.name ?? '');
        setFocalContact(data.focal?.contact ?? '');
        setFocalEmail(data.focal?.email ?? '');
        setFocalAddress(data.focal?.address ?? '');
        setFocalCoordinates(data.focal?.coordinates ?? '');
        setAltFocalName(data.focal?.altFocal ?? '');
        setPhotoUrl(data.focal?.photo ?? null);
    }, [open, data]);

    // revoke object URLs when photo changes / on unmount
    useEffect(() => {
        return () => {
            if (photoUrl && photoUrl.startsWith('blob:')) {
                try { URL.revokeObjectURL(photoUrl); } catch (e) { }
            }
        };
    }, [photoUrl]);

    // (image viewer utilities removed — not used in current UI)

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
    if (!open) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 'var(--z-popover)' }}>
            <div style={modalStyle}>
                <button onClick={() => setConfirmOpen(true)} aria-label="Close" style={{ position: 'absolute', right: 35, top: 30, background: 'transparent', border: 'none', color: '#BABABA', fontSize: 18, cursor: 'pointer' }}>✕</button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: 27, fontWeight: 800, letterSpacing: 0.6 }}>EDIT COMMUNITY</h2>
                        <div style={{ marginTop: 6, color: '#fff', fontSize: 13, fontWeight: 300 }}>Registered At: {data?.registeredAt ?? ''} <span style={{ fontWeight: 200, opacity: 0.5 }}> &nbsp; | &nbsp; </span> Last Updated At: {data?.updatedAt ?? ''}</div>
                    </div>
                </div>

                <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>

                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 14, fontWeight: 400, marginTop: 15 }}>Community Group Name</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ flex: 1, marginTop: 2 }}>
                                <Input value={groupName} style={{ padding: '22px 17px', border: '1px solid #404040', borderRadius: 6, background: 'transparent', color: '#fff', fontSize: 14 }} onChange={(e: any) => setGroupName(e.target.value)} className="bg-input/10 text-white" />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <div style={{ flex: 1, marginTop: 2 }}>
                                <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 14, fontWeight: 400, marginTop: 15 }}>Total No. of Individuals</div>
                                <Input value={individuals} type="number" style={{ padding: '21px 17px', border: '1px solid #404040', borderRadius: 6, background: 'transparent', color: '#fff', fontSize: 14 }} onChange={(e: any) => setIndividuals(Number(e.target.value) || 0)} className="bg-input/10 text-white" />
                            </div>
                            <div style={{ flex: 1, marginTop: 2 }}>
                                <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 14, fontWeight: 400, marginTop: 15 }}>Total No. of Families</div>
                                <Input value={families} type="number" style={{ padding: '21px 17px', border: '1px solid #404040', borderRadius: 6, background: 'transparent', color: '#fff', fontSize: 14 }} onChange={(e: any) => setFamilies(Number(e.target.value) || 0)} className="bg-input/10 text-white" />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <div style={{ flex: 1, marginTop: 2 }}>
                                <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 14, fontWeight: 400, marginTop: 15 }}>Total No. of Babies</div>
                                <Input value={kids} type="number" style={{ padding: '21px 17px', border: '1px solid #404040', borderRadius: 6, background: 'transparent', color: '#fff', fontSize: 14 }} onChange={(e: any) => setKids(Number(e.target.value) || 0)} className="bg-input/10 text-white" />
                            </div>
                            <div style={{ flex: 1, marginTop: 2 }}>
                                <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 14, fontWeight: 400, marginTop: 15 }}>Total No. of Senior Citizen</div>
                                <Input value={seniors} type="number" style={{ padding: '21px 17px', border: '1px solid #404040', borderRadius: 6, background: 'transparent', color: '#fff', fontSize: 14 }} onChange={(e: any) => setSeniors(Number(e.target.value) || 0)} className="bg-input/10 text-white" />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <div style={{ flex: 1, marginTop: 2 }}>
                                <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 14, fontWeight: 400, marginTop: 15 }}>Total No. of Pregnant Women</div>
                                <Input value={pregnant} type="number" style={{ padding: '21px 17px', border: '1px solid #404040', borderRadius: 6, background: 'transparent', color: '#fff', fontSize: 14 }} onChange={(e: any) => setPregnant(Number(e.target.value) || 0)} className="bg-input/10 text-white" />
                            </div>
                            <div style={{ flex: 1, marginTop: 2 }}>
                                <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 14, fontWeight: 400, marginTop: 15 }}>Total no. of PWDs</div>
                                <Input value={pwds} type="number" style={{ padding: '21px 17px', border: '1px solid #404040', borderRadius: 6, background: 'transparent', color: '#fff', fontSize: 14 }} onChange={(e: any) => setPwds(Number(e.target.value) || 0)} className="bg-input/10 text-white" />
                            </div>
                        </div>

                        <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 14, fontWeight: 400, marginTop: 15 }}>Other notable information</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ flex: 1, marginTop: 2 }}>
                                <Input value={otherInfo} style={{ padding: '22px 17px', border: '1px solid #404040', borderRadius: 6, background: 'transparent', color: '#fff', fontSize: 14 }} onChange={(e: any) => setOtherInfo(e.target.value)} className="bg-input/10 text-white" />
                            </div>
                        </div>

                    </div>
                    <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 15, fontWeight: 600, marginTop: 15 }}>Focal Person’s Information</div>


                    <div style={{ background: '#0b0b0b', borderRadius: 6, display: 'flex', justifyContent: 'center' }}>
                        <div style={{ width: '100%', maxWidth: '100%', height: 240, borderRadius: 8, overflow: 'hidden', position: 'relative', backgroundColor: '#111' }}>
                            <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${photoUrl ?? ''})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', filter: 'blur(18px) brightness(0.55)', transform: 'scale(1.2)' }} />
                            <img src={photoUrl ?? ''} alt="Focal" style={{ position: 'relative', width: 'auto', height: '100%', maxWidth: '60%', margin: '0 auto', objectFit: 'contain', display: 'block' }} />
                            <button
                                aria-label="Delete"
                                onClick={() => { setPhotoUrl(null); }}
                                style={{ position: 'absolute', right: 15, bottom: 15, width: 36, height: 36, borderRadius: 1, background: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
                                <Trash size={15} color="red" strokeWidth={3} />
                            </button>
                        </div>
                    </div>


                </div>

                <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 14, fontWeight: 400, marginTop: 30 }}>Name</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1, marginTop: 2 }}>
                        <Input value={focalName} style={{ padding: '22px 17px', border: '1px solid #404040', borderRadius: 6, background: 'transparent', color: '#fff', fontSize: 14 }} onChange={(e: any) => setFocalName(e.target.value)} className="bg-input/10 text-white" />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ flex: 1, marginTop: 2 }}>
                        <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 14, fontWeight: 400, marginTop: 17 }}>Contact Number</div>
                        <Input value={focalContact} style={{ padding: '21px 17px', border: '1px solid #404040', borderRadius: 6, background: 'transparent', color: '#fff', fontSize: 14 }} onChange={(e: any) => setFocalContact(e.target.value)} className="bg-input/10 text-white" />
                    </div>
                    <div style={{ flex: 1, marginTop: 2 }}>
                        <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 14, fontWeight: 400, marginTop: 17 }}>Email</div>
                        <Input value={focalEmail} style={{ padding: '21px 17px', border: '1px solid #404040', borderRadius: 6, background: 'transparent', color: '#fff', fontSize: 14 }} onChange={(e: any) => setFocalEmail(e.target.value)} className="bg-input/10 text-white" />
                    </div>
                </div>

                <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 14, fontWeight: 400, marginTop: 16 }}>Address</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, marginTop: 2, position: 'relative' }}>
                        <Input value={focalAddress} style={{ padding: '22px 46px 22px 17px', border: '1px solid #404040', borderRadius: 6, background: '#262626', color: '#BABABA', fontSize: 14 }} onChange={(e: any) => setFocalAddress(e.target.value)} className="bg-input/10 text-white" />
                        <div title="Help: format should be 'Street, Barangay, City, Zip'" onClick={() => {/* optional help action */ }}
                            style={{ position: 'absolute', right: 15, top: '50%', transform: 'translateY(-50%)', width: 21, height: 21, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', cursor: 'pointer' }}>
                            <HelpCircle color="#9CA3AF" />
                        </div>
                    </div>
                </div>

                <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 14, fontWeight: 400, marginTop: 16 }}>Coordinates</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1, marginTop: 2 }}>
                        <Input value={focalCoordinates} style={{ padding: '22px 17px', border: '1px solid #404040', borderRadius: 6, background: '#262626', color: '#BABABA', fontSize: 14 }} onChange={(e: any) => setFocalCoordinates(e.target.value)} className="bg-input/10 text-white" />
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
                        {/* {photoUrl ? <img src={photoUrl} alt="preview" style={{ marginTop: 12, maxWidth: 160, borderRadius: 6 }} /> : null} */}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" style={{ display: 'none' }} onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        try {
                            const url = URL.createObjectURL(f);
                            // revoke previous blob url if any
                            if (photoUrl && photoUrl.startsWith('blob:')) {
                                try { URL.revokeObjectURL(photoUrl); } catch (e) { }
                            }
                            setPhotoUrl(url);
                        } catch (err) { }
                    }} />
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                    <div style={{ flex: 1, marginTop: 2 }}>
                        <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 14, fontWeight: 400, marginTop: 17 }}>Name</div>
                        <Input value={altFocalName} style={{ padding: '21px 17px', border: '1px solid #404040', borderRadius: 6, background: 'transparent', color: '#fff', fontSize: 14 }} onChange={(e: any) => setAltFocalName(e.target.value)} className="bg-input/10 text-white" />
                    </div>
                    <div style={{ flex: 1, marginTop: 2 }}>
                        <div style={{ padding: '0 0 6px 0', color: '#fff', fontSize: 14, fontWeight: 400, marginTop: 17 }}>Contact Number</div>
                        <Input value={focalContact} style={{ padding: '21px 17px', border: '1px solid #404040', borderRadius: 6, background: 'transparent', color: '#fff', fontSize: 14 }} onChange={(e: any) => setFocalContact(e.target.value)} className="bg-input/10 text-white" />
                    </div>
                </div>

                <div style={{ marginTop: 30, display: 'flex', gap: 12, width: '100%' }}>
                    <button
                        onClick={() => setConfirmSaveOpen(true)}
                        className="w-full bg-gradient-to-t from-[#3B82F6] to-[#70A6FF] transition-colors duration-150 cursor-pointer hover:from-[#2563eb] hover:to-[#60a5fa] text-white py-3 px-4.5 rounded-md font-medium text-[15px] tracking-[0.6px] border-0"
                        style={{ width: '100%' }}
                    >
                        SAVE CHANGES
                    </button>
                </div>

                {/* Alert dialog for confirming leaving without saving */}
                <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone. This will permanently discard your changes.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setConfirmOpen(false)} className="px-4 py-2 mt-3 bg-[#1b1b1b] text-white border border-[#3E3E3E] cursor-pointer transition duration-175 hover:bg-[#222222]" style={{ borderRadius: 8, fontSize: 15 }}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={() => {
                                setConfirmOpen(false);
                                // If parent supplied a continue action (e.g. navigate), call it.
                                if (pendingContinueRef.current) {
                                    try { pendingContinueRef.current(); } catch (e) { }
                                    pendingContinueRef.current = null;
                                } else {
                                    onClose();
                                }
                            }} className="px-4 py-2 mt-3 bg-[#fff] text-black hover:bg-[#e2e2e2] rounded cursor-pointer transition duration-175" style={{ borderRadius: 8, fontSize: 15 }}>
                                Continue
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Save confirmation dialog */}
                <AlertDialog open={confirmSaveOpen} onOpenChange={setConfirmSaveOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Save changes?</AlertDialogTitle>
                            <AlertDialogDescription>Do you want to save your changes to the community information? This will update the community data.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setConfirmSaveOpen(false)} className="px-4 py-2 mt-3 bg-[#1b1b1b] text-white border border-[#3E3E3E] cursor-pointer transition duration-175 hover:bg-[#222222]" style={{ borderRadius: 8, fontSize: 15 }}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={() => {
                                // merge current changes into the shared store
                                const next = {
                                    ...data,
                                    groupName: groupName,
                                    stats: {
                                        individuals,
                                        families,
                                        kids,
                                        seniors,
                                        pwds,
                                        pregnant,
                                    },
                                    note: otherInfo,
                                    focal: {
                                        ...(data.focal || {}),
                                        name: focalName,
                                        contact: focalContact,
                                        email: focalEmail,
                                        address: focalAddress,
                                        coordinates: focalCoordinates,
                                        altFocal: altFocalName,
                                        photo: photoUrl,
                                    },
                                    updatedAt: new Date().toLocaleString(),
                                };
                                try { setData(next); } catch (e) { }
                                onSave?.(next);
                                setConfirmSaveOpen(false);
                                onClose();
                            }} className="px-4 py-2 mt-3  bg-gradient-to-t from-[#3B82F6] to-[#70A6FF] text-white hover:from-[#2563eb] hover:to-[#60a5fa] cursor-pointer transition duration-175" style={{ borderRadius: 8, fontSize: 15 }}>
                                Continue
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

        </div>
    );
});

export default EditAbout;
