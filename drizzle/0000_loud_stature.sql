CREATE TABLE `ai_provider_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`api_key` text,
	`model_name` text NOT NULL,
	`base_url` text,
	`temperature` real DEFAULT 0.7,
	`is_active` integer DEFAULT 1,
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `companies` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`instagram_handle` text NOT NULL,
	`niche` text NOT NULL,
	`tone_of_voice` text NOT NULL,
	`primary_color` text DEFAULT '#6366F1',
	`secondary_color` text DEFAULT '#EC4899',
	`background_color` text DEFAULT '#0F172A',
	`accent_color` text DEFAULT '#10B981',
	`whatsapp_number` text,
	`whatsapp_default_message` text,
	`website_url` text,
	`canva_template_id` text,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `photo_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text NOT NULL,
	`filename` text NOT NULL,
	`original_name` text NOT NULL,
	`file_path` text NOT NULL,
	`category` text NOT NULL,
	`tags` text,
	`times_used` integer DEFAULT 0,
	`uploaded_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `post_slides` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`slide_number` integer NOT NULL,
	`title` text,
	`body_text` text,
	`cta_text` text,
	`assigned_photo_id` text,
	`template_id` text DEFAULT 'modern-bold',
	`rendered_image_url` text,
	`image_prompt` text,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`assigned_photo_id`) REFERENCES `photo_assets`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`schedule_id` text NOT NULL,
	`company_id` text NOT NULL,
	`day_of_week` text NOT NULL,
	`theme` text NOT NULL,
	`category` text NOT NULL,
	`slide_count` integer DEFAULT 5 NOT NULL,
	`status` text DEFAULT 'draft',
	`caption` text,
	`selected_photo_ids` text,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`schedule_id`) REFERENCES `weekly_schedules`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `weekly_schedules` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text NOT NULL,
	`week_start_date` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE cascade
);
