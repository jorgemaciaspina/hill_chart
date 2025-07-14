class Project < ApplicationRecord
  has_many :hill_tasks, dependent: :destroy
  has_many :project_snapshots, dependent: :destroy
  validates :name, presence: true
  validates :name, uniqueness: true
end
