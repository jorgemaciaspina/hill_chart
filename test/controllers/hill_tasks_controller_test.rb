require "test_helper"

class HillTasksControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get hill_tasks_index_url
    assert_response :success
  end

  test "should get create" do
    get hill_tasks_create_url
    assert_response :success
  end

  test "should get update" do
    get hill_tasks_update_url
    assert_response :success
  end

  test "should get destroy" do
    get hill_tasks_destroy_url
    assert_response :success
  end
end
