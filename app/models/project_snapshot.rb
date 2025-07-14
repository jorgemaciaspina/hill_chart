class ProjectSnapshot < ApplicationRecord
  belongs_to :project

  validates :svg_data, presence: true
end
