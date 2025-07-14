class ProjectSnapshotsController < ApplicationController
  before_action :set_project

  def index
    @project_snapshots = @project.project_snapshots.order(created_at: :desc)
    render partial: "project_snapshots/list", locals: { project_snapshots: @project_snapshots }
  end

  def create
    svg = params.require(:project_snapshot).permit(:svg_data)[:svg_data]
    snapshot = @project.project_snapshots.create!(svg_data: svg)
    render json: { id: snapshot.id }, status: :created
  end

  private

  def set_project
    @project = Project.find(params[:project_id])
  end
end
