CREATE TABLE "question_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"question_id" text NOT NULL,
	"answer" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "question_answers_employee_question_unique" UNIQUE("employee_id","question_id")
);
--> statement-breakpoint
ALTER TABLE "question_answers" ADD CONSTRAINT "question_answers_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;