class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern
  skip_before_action :verify_authenticity_token
  before_action :authenticate!

  private

  def authenticate!
    Rails.logger.info "ASU MARI: #{session[:user]}"
    return if !session[:user].nil? && session[:user] == ENV["HILL_USERNAME"]

    redirect_to login_path
  end
end
