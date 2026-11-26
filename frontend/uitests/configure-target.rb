require 'xcodeproj'

ios_root, bundle_id = ARGV
project_path, *extra_projects = Dir.glob(File.join(ios_root, '*.xcodeproj'))
abort 'Expected one Expo Xcode project' if project_path.nil? || !extra_projects.empty?

project = Xcodeproj::Project.open(project_path)
app = project.targets.find { |target| target.product_type == 'com.apple.product-type.application' }
abort 'Could not locate the Expo app target' unless app

target_name = 'ShuttleGoUITests'
tests = project.targets.find { |target| target.name == target_name }
unless tests
  tests = project.new_target(:ui_test_bundle, target_name, :ios, app.deployment_target, nil, :swift)
  tests.add_dependency(app)
end

group = project.main_group.groups.find { |item| item.display_name == target_name } ||
        project.main_group.new_group(target_name, '../uitests')
group.files.select { |file| file.path == 'ShuttleGoUITests.swift' }.each(&:remove_from_project)
sources = Dir.glob(File.join(__dir__, '*.swift')).map { |path| File.basename(path) }.sort
sources.each do |name|
  file = group.files.find { |reference| reference.path == name } || group.new_file(name)
  tests.source_build_phase.add_file_reference(file, true)
end

data_name = 'ShuttleGoUITestData.json'
data = group.files.find { |file| file.path == data_name }
if File.file?(File.join(__dir__, data_name))
  tests.resources_build_phase.add_file_reference(data || group.new_file(data_name), true)
elsif data
  data.remove_from_project
end

tests.build_configurations.each do |config|
  config.build_settings.merge!(
    'GENERATE_INFOPLIST_FILE' => 'YES',
    'PRODUCT_NAME' => target_name,
    'PRODUCT_BUNDLE_IDENTIFIER' => "#{bundle_id}.uitests",
    'SWIFT_VERSION' => '5.0',
    'TEST_TARGET_NAME' => app.name
  )
end
project.root_object.attributes.fetch('TargetAttributes', {}).tap do |attributes|
  attributes[tests.uuid] = (attributes[tests.uuid] || {}).merge('TestTargetID' => app.uuid)
  project.root_object.attributes['TargetAttributes'] = attributes
end
project.save

scheme_path = File.join(project_path, 'xcshareddata', 'xcschemes', "#{target_name}.xcscheme")
unless File.exist?(scheme_path)
  scheme = Xcodeproj::XCScheme.new
  scheme.configure_with_targets(app, tests)
  scheme.test_action.build_configuration = 'Release'
  scheme.test_action.should_use_launch_scheme_args_env = false
  scheme.save_as(project_path, target_name, true)
end

app_scheme_path = File.join(project_path, 'xcshareddata', 'xcschemes', "#{app.name}.xcscheme")
if File.file?(app_scheme_path)
  app_scheme = Xcodeproj::XCScheme.new(app_scheme_path)
  app_scheme.test_action.testables = [Xcodeproj::XCScheme::TestAction::TestableReference.new(tests)]
  app_scheme.save!
end
