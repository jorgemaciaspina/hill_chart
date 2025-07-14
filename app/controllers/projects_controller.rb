class ProjectsController < ApplicationController
  def index
    @projects = Project.all
  end

  def show
    @project = Project.find(params[:id])
    @project_snapshots = @project.project_snapshots.order(created_at: :desc)
  end

  def new
    @project = Project.new
  end

  def create
    @project = Project.new(project_params)
    if @project.save
      redirect_to @project, notice: "Project created successfully"
    else
      render :new, status: :unprocessable_entity, notice: "Failed to create project"
    end
  end

  private

  def project_params
    params.require(:project).permit(:name)
  end
end
