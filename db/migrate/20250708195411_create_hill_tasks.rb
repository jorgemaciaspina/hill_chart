class CreateHillTasks < ActiveRecord::Migration[8.0]
  def change
    create_table :hill_tasks do |t|
      t.string :title
      t.float :position
      t.integer :state
      t.references :project, null: false, foreign_key: true

      t.timestamps
    end
  end
end
