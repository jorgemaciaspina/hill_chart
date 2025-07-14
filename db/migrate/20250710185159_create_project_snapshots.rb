class CreateProjectSnapshots < ActiveRecord::Migration[8.0]
  def change
    create_table :project_snapshots do |t|
      t.references :project, null: false, foreign_key: true
      t.text :svg_data

      t.timestamps
    end
  end
end
