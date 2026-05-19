'use client';
import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { getDb, getAuthService, handleFirestoreError } from "../lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Trash2, Edit2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function UserBookings() {
  const db = getDb();
  const auth = getAuthService();
  const [bookings, setBookings] = useState<any[]>([]);
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [newNotes, setNewNotes] = useState("");

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, "bookings"),
      where("userId", "==", auth.currentUser.uid)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setBookings(snapshot.docs.map(doc => {
         const data = doc.data();
         return {
           id: doc.id,
           packageId: typeof data.packageId === 'string' ? data.packageId : "",
           packageName: typeof data.packageName === 'string' ? data.packageName : "",
           userId: typeof data.userId === 'string' ? data.userId : "",
           status: typeof data.status === 'string' ? data.status : "",
           date: typeof data.date === 'string' ? data.date : "",
           time: typeof data.time === 'string' ? data.time : "",
           amount: Number(data.amount) || 0,
           createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : ""
         } as any;
      }));
    }, (error) => {
      handleFirestoreError(error, 'list', 'bookings');
    });
    return () => unsub();
  }, [auth.currentUser, db]);

  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!bookingToDelete) return;
    try {
      await deleteDoc(doc(db, "bookings", bookingToDelete));
      setBookingToDelete(null);
    } catch (err) {
      handleFirestoreError(err, 'delete', `bookings/${bookingToDelete}`);
    }
  };

  const handleEdit = (booking: any) => {
    setEditingBooking(booking);
    setNewNotes(booking.notes);
  };

  const saveEdit = async () => {
    if (!editingBooking) return;
    try {
      await updateDoc(doc(db, "bookings", editingBooking.id), { notes: newNotes });
      setEditingBooking(null);
    } catch (err) {
      handleFirestoreError(err, 'update', `bookings/${editingBooking.id}`);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif font-light text-brand-black tracking-tight">My Bookings</h2>
      {bookings.map((booking) => (
        <Card key={booking.id} className="bg-white border-brand-line">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-sm font-bold uppercase tracking-widest">{booking.packageName}</CardTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => handleEdit(booking)}><Edit2 size={14} /></Button>
              <Button variant="ghost" size="sm" onClick={() => setBookingToDelete(booking.id)} className="text-red-500"><Trash2 size={14} /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-brand-muted">Date: {booking.date ? format(new Date(booking.date), 'PPP') : 'N/A'}</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-brand-muted">Status: {booking.status}</p>
              {booking.status === 'sanitized' && (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] uppercase tracking-wider h-5 font-bold">
                  Project Data Sanitized: Raw assets purged for your privacy.
                </Badge>
              )}
            </div>
            <p className="text-xs text-brand-muted mt-2">Notes: {booking.notes}</p>
          </CardContent>
        </Card>
      ))}

      <Dialog open={!!bookingToDelete} onOpenChange={() => setBookingToDelete(null)}>
        <DialogContent>
            <DialogHeader><DialogTitle>Are you sure?</DialogTitle></DialogHeader>
            <p className="text-sm">This action cannot be undone.</p>
            <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setBookingToDelete(null)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDelete}>Delete Booking</Button>
            </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!editingBooking} onOpenChange={() => setEditingBooking(null)}>
        <DialogContent>
            <DialogHeader><DialogTitle>Edit Booking Notes</DialogTitle></DialogHeader>
            <Input value={newNotes} onChange={(e) => setNewNotes(e.target.value)} />
            <Button onClick={saveEdit}>Save Changes</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
