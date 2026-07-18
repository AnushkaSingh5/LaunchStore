import { supabaseClient } from '@/lib/supabase';

let mockProfile = {
  full_name: 'Anushka Singh',
  phone: '9876543210',
  date_of_birth: '1995-08-15',
  gender: 'Female',
  profile_image: '',
  bio: 'Design enthusiast and e-commerce creator.',
  business_name: 'Anushka Creations',
  business_type: 'Individual',
  address: '123 E-Commerce Lane',
  city: 'Delhi',
  state: 'Delhi',
  country: 'India',
  postal_code: '110001',
  verification_status: 'Under Review'
};

let mockDocuments = [
  { id: 'doc-mock-1', creator_id: 'mock-creator-uid', document_type: 'Government ID Proof', document_url: 'https://placehold.co/600x400?text=Government+ID+Proof', status: 'Verified', uploaded_at: '2026-06-15T12:00:00Z' },
  { id: 'doc-mock-2', creator_id: 'mock-creator-uid', document_type: 'Address Proof', document_url: 'https://placehold.co/600x400?text=Address+Proof', status: 'Under Review', uploaded_at: '2026-06-18T10:00:00Z' }
];

let forceMockMode = false;

export const profileService = {
  _getMockProfile: () => mockProfile,
  _getMockDocuments: () => mockDocuments,
  _setForceMockMode: (val) => { forceMockMode = val; },

  getProfile: async (userId) => {
    if (!supabaseClient || forceMockMode) {
      return { success: true, profile: mockProfile };
    }
    try {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        if (error.code === '42P01' || error.code === 'PGRST205') {
          forceMockMode = true;
          return profileService.getProfile(userId);
        }
        throw error;
      }
      const mappedProfile = {
        ...data,
        full_name: data ? data.name : ''
      };
      return { success: true, profile: mappedProfile };
    } catch (e) {
      console.error('Error fetching profile:', e);
      return { success: false, error: e.message, profile: mockProfile };
    }
  },

  updateProfile: async (userId, profileData) => {
    if (!supabaseClient || forceMockMode) {
      mockProfile = { ...mockProfile, ...profileData };
      return { success: true, profile: mockProfile };
    }
    try {
      const dbData = { ...profileData };
      if ('full_name' in dbData) {
        dbData.name = dbData.full_name;
        delete dbData.full_name;
      }
      const { data, error } = await supabaseClient
        .from('profiles')
        .update(dbData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        if (error.code === '42P01' || error.code === 'PGRST205') {
          forceMockMode = true;
          return profileService.updateProfile(userId, profileData);
        }
        throw error;
      }
      const mappedProfile = {
        ...data,
        full_name: data ? data.name : ''
      };
      return { success: true, profile: mappedProfile };
    } catch (e) {
      console.error('Error updating profile:', e);
      return { success: false, error: e.message };
    }
  },

  uploadProfilePhoto: async (file, userId) => {
    if (!supabaseClient || forceMockMode) {
      const reader = new FileReader();
      const p = new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result);
      });
      reader.readAsDataURL(file);
      const url = await p;
      mockProfile.profile_image = url;
      return { success: true, publicUrl: url };
    }
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/profile-${Date.now()}.${fileExt}`;

      const { data, error } = await supabaseClient.storage
        .from('profile-photos')
        .upload(filePath, file, { upsert: true });

      if (error) {
        if (error.message?.includes('Bucket not found') || error.message?.includes('bucket_not_found')) {
          console.warn('[LaunchCart - Storage] Bucket "profile-photos" not found. Creating it...');
          try {
            await supabaseClient.storage.createBucket('profile-photos', { public: true });
            const { error: retryError } = await supabaseClient.storage
              .from('profile-photos')
              .upload(filePath, file, { upsert: true });
            if (retryError) throw retryError;
          } catch (createErr) {
            console.error('Failed to create bucket programmatically, falling back to base64');
            const reader = new FileReader();
            const p = new Promise((resolve) => {
              reader.onloadend = () => resolve(reader.result);
            });
            reader.readAsDataURL(file);
            const url = await p;
            mockProfile.profile_image = url;
            return { success: true, publicUrl: url };
          }
        } else {
          throw error;
        }
      }

      const { data: { publicUrl } } = supabaseClient.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      await profileService.updateProfile(userId, { profile_image: publicUrl });

      return { success: true, publicUrl };
    } catch (e) {
      console.error('Error uploading photo:', e);
      return { success: false, error: e.message };
    }
  },

  uploadVerificationDocument: async (file, documentType, creatorId) => {
    if (!supabaseClient || forceMockMode) {
      const reader = new FileReader();
      const p = new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result);
      });
      reader.readAsDataURL(file);
      const url = await p;

      const idx = mockDocuments.findIndex(d => d.document_type === documentType);
      const doc = {
        id: idx !== -1 ? mockDocuments[idx].id : `doc-mock-${Date.now()}`,
        creator_id: creatorId,
        document_type: documentType,
        document_url: url,
        status: 'Under Review',
        uploaded_at: new Date().toISOString()
      };
      if (idx !== -1) {
        mockDocuments[idx] = doc;
      } else {
        mockDocuments.push(doc);
      }
      mockProfile.verification_status = 'Under Review';
      return { success: true, document: doc };
    }

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${creatorId}/${documentType.replace(/\s+/g, '_')}-${Date.now()}.${fileExt}`;

      let publicUrl = '';
      try {
        const { error: uploadError } = await supabaseClient.storage
          .from('verification-documents')
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl: url } } = supabaseClient.storage
          .from('verification-documents')
          .getPublicUrl(filePath);
        publicUrl = url;
      } catch (storageErr) {
        console.warn('⚠️ [LaunchCart - Storage] Storage upload failed, falling back to database base64 storage:', storageErr.message);
        const reader = new FileReader();
        const p = new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
        });
        reader.readAsDataURL(file);
        publicUrl = await p;
      }

      const { data, error } = await supabaseClient
        .from('creator_documents')
        .upsert({
          creator_id: creatorId,
          document_type: documentType,
          document_url: publicUrl,
          status: 'Under Review',
          uploaded_at: new Date().toISOString()
        }, {
          onConflict: 'creator_id,document_type'
        })
        .select()
        .single();

      if (error) {
        if (error.code === '42P01' || error.code === 'PGRST205') {
          forceMockMode = true;
          return profileService.uploadVerificationDocument(file, documentType, creatorId);
        }
        throw error;
      }

      await profileService.updateProfile(creatorId, { verification_status: 'Under Review' });

      return { success: true, document: data };
    } catch (e) {
      console.warn('Error uploading document:', e);
      return { success: false, error: e.message };
    }
  },

  getCreatorDocuments: async (creatorId) => {
    if (!supabaseClient || forceMockMode) {
      return { success: true, documents: mockDocuments };
    }
    try {
      const { data, error } = await supabaseClient
        .from('creator_documents')
        .select('*')
        .eq('creator_id', creatorId);

      if (error) {
        if (error.code === '42P01' || error.code === 'PGRST205') {
          forceMockMode = true;
          return profileService.getCreatorDocuments(creatorId);
        }
        throw error;
      }
      return { success: true, documents: data || [] };
    } catch (e) {
      console.error('Error fetching creator documents:', e);
      return { success: false, error: e.message, documents: mockDocuments };
    }
  },

  adminUpdateVerificationStatus: async (creatorId, status) => {
    if (!supabaseClient || forceMockMode) {
      mockProfile.verification_status = status;
      mockDocuments.forEach(d => {
        d.status = status;
      });
      return { success: true };
    }
    try {
      const { error } = await supabaseClient
        .from('profiles')
        .update({ verification_status: status })
        .eq('id', creatorId);

      if (error) {
        if (error.code === '42P01' || error.code === 'PGRST205') {
          forceMockMode = true;
          return profileService.adminUpdateVerificationStatus(creatorId, status);
        }
        throw error;
      }

      const docsRes = await profileService.getCreatorDocuments(creatorId);
      if (docsRes.success && docsRes.documents.length > 0) {
        const docPromises = docsRes.documents.map(d => 
          supabaseClient.from('creator_documents').update({ status }).eq('id', d.id)
        );
        await Promise.all(docPromises);
      }

      return { success: true };
    } catch (e) {
      console.error('Error updating verification status:', e);
      return { success: false, error: e.message };
    }
  }
};

export default profileService;
