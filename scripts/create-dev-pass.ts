import { supabaseAdmin } from '../src/config/supabase';

async function createDev() {
  const email = 'dev@vibesec.local';
  const password = 'srmcbj@3';

  console.log('Creating developer pass account...');
  
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    user_metadata: { plan: 'developer' },
    email_confirm: true
  });

  if (error) {
    if (error.message.includes('already registered')) {
      console.log('User already exists. Updating metadata to developer tier...');
      // Update existing user
      const users = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = users.data.users.find(u => u.email === email);
      if (existingUser) {
        await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
          user_metadata: { plan: 'developer' }
        });
        console.log('Successfully upgraded existing dev user.');
      }
    } else {
      console.error('Error creating user:', error.message);
    }
  } else {
    console.log('Developer account successfully created!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  }
}

createDev();
