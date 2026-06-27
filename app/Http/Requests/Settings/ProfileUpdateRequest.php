<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($this->user()->id),
            ],
            'gender' => ['required', 'in:Male,Female,Prefer not to say'],
            'birthday' => ['required', 'date', 'before:today'],
            'province' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'island' => ['required', 'in:Luzon,Visayas,Mindanao'],
            'address' => ['required', 'string', 'max:500'],
            'profile_photo' => ['nullable', 'image', 'max:5120'],
        ];
    }
}
