<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    public function updateProfilePicture(Request $request)
    {
        $request->validate([
            'profile_picture' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user = $request->user();

        // Delete old profile picture if it exists
        if ($user->profile_picture && !str_contains($user->profile_picture, 'default-avatar.png')) {
            // Extract the file path from the URL
            $path = str_replace('/storage/', '', $user->profile_picture);
            Storage::disk('public')->delete($path);
        }

        // Store new picture and get the path
        $path = $request->file('profile_picture')->store('profile_pictures', 'public');

        // Save the full URL to the database
        $user->update([
            'profile_picture' => "/storage/{$path}"
        ]);

        return back()->with('success', 'Profile picture updated successfully.');
    }

    public function removeProfilePicture(Request $request)
    {
        $user = $request->user();

        // Only process if user has a custom profile picture
        if ($user->profile_picture && !str_contains($user->profile_picture, 'default-avatar.png')) {
            // Extract the file path from the URL
            $path = str_replace('/storage/', '', $user->profile_picture);

            // Delete the file from storage
            Storage::disk('public')->delete($path);

            // Set profile picture to null or default
            $user->update([
                'profile_picture' => '/storage/profile_pictures/default-avatar.png'
            ]);

            return response()->json(['success' => true, 'message' => 'Profile picture removed successfully.']);
        }

        return response()->json(['success' => false, 'message' => 'No custom profile picture to remove.']);
    }
}
