class SessionsController < ApplicationController
  skip_before_action :authenticate!, only: [:new, :create]

  def new; end

  def create
    Rails.logger.info "ASU MARI: #{params[:username]} #{params[:password]}"
    if params[:username] == ENV["HILL_USERNAME"] && params[:password] == ENV["HILL_PASSWORD"]
      session[:user] = params[:username]
      redirect_to root_path
    else
      create_alert
    end
  end

  def destroy
    reset_session
    redirect_to login_path
  end

  private

  def create_alert
    respond_to do |format|
      format.turbo_stream {
        flash.now[:alert] = "Invalid credentials"
        render turbo_stream: turbo_stream.replace("flash",
          partial: "shared/flash")
      }
    end
  end
end
