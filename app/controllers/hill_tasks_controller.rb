class HillTasksController < ApplicationController

  before_action :set_project

  def index
    render json: @project.hill_tasks
  end

  def create
    @project.hill_tasks.create!(task_params)
    redirect_to @project, notice: "Task added"
  end

  def update
    task = @project.hill_tasks.find(params[:id])
    task.update!(task_params)
    render json: task
  end

  def destroy
    @project.hill_tasks.find(params[:id]).destroy!
    head :no_content
  end

  private

  def set_project
    @project = Project.find(params[:project_id])
  end

  def task_params
    params.require(:hill_task).permit(:title, :position, :state)
  end
end
