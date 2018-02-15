<?php

use Illuminate\Database\Seeder;

/**
 * Laravel-auditable package tracks db:seed operations but don't
 * assign users to console generated audit events. To avoid only
 * anonymous audits, we randomly assign users to some of them.
 */
class AuditsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $users = DB::table("users")->select("id")->get();
        DB::table('audits')->inRandomOrder()->take(25)->get()->each(function ($row) use ($users) {
            DB::table("audits")->where('id', data_get($row, "id"))->update(["user_id" => data_get($users->random(), "id")]);
        });
    }
}
