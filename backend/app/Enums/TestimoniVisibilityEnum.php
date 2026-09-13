<?php

namespace App\Enums;

/**
 * Visibility of a customer testimonial.
 *
 * - Private: internal only (default) — visible in the admin CMS.
 * - Public: approved for display on the public Testimonials page (future D3).
 */
enum TestimoniVisibilityEnum: string
{
    case Public = 'public';
    case Private = 'private';
}
