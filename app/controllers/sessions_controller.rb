class SessionsController < ApplicationController
  skip_before_action :authenticate!, only: [:new, :create]

  def new; end

  def create
    if params[:username] == ENV["HILL_USERNAME"] && params[:password] == ENV["HILL_PASSWORD"]
      session[:user] = params[:username]
      redirect_to root_path
    else
      flash.now[:alert] = "Invalid credentials"
      render :new
    end
  end

  def destroy
    reset_session
    redirect_to login_path
  end
end
