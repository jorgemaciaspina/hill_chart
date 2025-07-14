class HillTask < ApplicationRecord
  belongs_to :project

  enum :state, { uphill: 0, crest: 1, downhill: 2 }
  validates :title, :position, :state, presence: true
end
